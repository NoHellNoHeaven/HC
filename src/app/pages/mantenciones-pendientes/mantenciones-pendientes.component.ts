import { Component, inject, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CamionService, Camion } from "../../servicios/camion.service";
import { NavbarComponent } from "../navbar/navbar.component";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: "app-mantenciones-pendientes",
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './mantenciones-pendientes.component.html',
  styleUrls: ['./mantenciones-pendientes.component.css']
})
export class MantencionesPendientesComponent implements OnInit, OnDestroy {
  camionService = inject(CamionService);
  http = inject(HttpClient);

  camion: Camion | null = null;
  mantencionesPendientes: any[] = [];
  mantencionesProximas: any[] = [];

  ngOnInit() {
    // Primero intentar obtener el camión seleccionado del localStorage
    const camionLocal = this.camionService.getCamionSeleccionadoLocal();
    
    if (camionLocal && camionLocal.patente) {
      // Cargar datos frescos desde la base de datos
      this.camionService.obtenerCamion(camionLocal.patente).subscribe({
        next: (camionActualizado) => {
          this.camion = camionActualizado;
          this.camionService.setCamionSeleccionado(camionActualizado);
          this.procesarMantenciones();
        },
        error: (error) => {
          console.error('Error al cargar camión desde BD:', error);
          // Si falla, usar los datos locales como fallback
          this.camion = camionLocal;
          this.procesarMantenciones();
        }
      });
    } else {
      // Si no hay camión seleccionado, suscribirse a cambios
      this.camionService.camionSeleccionado$.subscribe((camion) => {
        this.camion = camion;
        this.procesarMantenciones();
      });
    }

    // Agregar listener para recargar datos cuando la ventana recupera el foco
    window.addEventListener('focus', () => {
      this.recargarDatosFrescos();
    });
  }

  ngOnDestroy() {
    // Remover el event listener cuando el componente se destruye
    window.removeEventListener('focus', () => {
      this.recargarDatosFrescos();
    });
  }

  // Método para recargar datos frescos desde la base de datos
  private recargarDatosFrescos() {
    if (this.camion && this.camion.patente) {
      this.camionService.obtenerCamion(this.camion.patente).subscribe({
        next: (camionActualizado) => {
          this.camion = camionActualizado;
          this.camionService.setCamionSeleccionado(camionActualizado);
          this.procesarMantenciones();
          console.log('Datos recargados al recuperar foco:', camionActualizado);
        },
        error: (error) => {
          console.error('Error al recargar datos al recuperar foco:', error);
        }
      });
    }
  }

  procesarMantenciones() {
    if (!this.camion) return;

    const kmActual = this.camion.kilometraje;
    const hoy = new Date();

    this.mantencionesPendientes = [];
    this.mantencionesProximas = [];

    (this.camion as any).mantenciones?.forEach((mantencion: any) => {
      const diferencia = kmActual - (mantencion.proximoKilometraje ?? 0);
      let criticidad = 'Baja';
      if (diferencia > 500) {
        criticidad = 'Crítica';
      } else if (diferencia > 100) {
        criticidad = 'Alta';
      }
      const mapeada = {
        ...mantencion,
        camionPatente: this.camion?.patente,
        camionMarca: this.camion?.marca,
        camionModelo: this.camion?.modelo,
        tipo: this.obtenerCategoriaMantencion(mantencion.nombre), // Obtener categoría con icono
        criticidad: criticidad,
        descripcion: mantencion.descripcion || `${mantencion.nombre} (${mantencion.accion || mantencion.accionSeleccionada || ''})`,
        kmProgramado: mantencion.proximoKilometraje,
        kmActual: kmActual,
        estado: '', // Se calcula abajo
        fecha: null // Se calcula abajo si aplica
      };

      // Calcular fecha de vencimiento si aplica
      let fechaVencimiento: Date | null = null;
      if (mapeada.meses > 0 && this.camion?.fRevisionTecnica) {
        const fechaBase = new Date(this.camion.fRevisionTecnica);
        fechaVencimiento = new Date(fechaBase);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + mapeada.meses);
        mapeada.fecha = fechaVencimiento;
      }

      // Determinar si está vencida
      const vencida = kmActual >= mapeada.proximoKilometraje || (fechaVencimiento !== null && fechaVencimiento <= hoy);
      mapeada.estado = vencida ? 'Vencida' : 'Próxima';

      if (vencida) {
        this.mantencionesPendientes.push(mapeada);
      } else {
        this.mantencionesProximas.push(mapeada);
      }
    });
  }

  // Método para obtener la categoría de una mantención con icono
  obtenerCategoriaMantencion(nombreMantencion: string): string {
    const categorias = {
      // 🛢️ Lubricación
      'Aceite de motor': '🛢️ Lubricación',
      'Filtro de aceite': '🛢️ Lubricación',
      
      // ⚫ Neumáticos y Frenos
      'Reemplazo de neumáticos': '⚫ Neumáticos y Frenos',
      'Revisión de frenos': '⚫ Neumáticos y Frenos',
      
      // 🔧 Mecánica
      'Filtro de aire': '🔧 Mecánica',
      'Revisión de tren delantero': '🔧 Mecánica',
      'Revisión de suspensión': '🔧 Mecánica',
      'Cambio de correa de distribución': '🔧 Mecánica'
    };
    
    return categorias[nombreMantencion as keyof typeof categorias] || '🔧 Mantención';
  }

  // Método para marcar una mantención como completada y reprogramarla
  completarMantencion(mantencion: any) {
    if (!this.camion) {
      alert('No hay camión seleccionado');
      return;
    }

    // El backend ya registra automáticamente en el historial cuando se completa una mantención
    this.camionService.completarMantencion(mantencion.id).subscribe({
      next: (resp) => {
        console.log('Mantención completada y registrada en historial:', resp);
        
        // Vuelve a cargar el camión actualizado y reprocesa las mantenciones
        this.camionService.obtenerCamion(this.camion?.patente!).subscribe({
          next: (camionActualizado) => {
            this.camion = camionActualizado;
            // Actualizar también el camión seleccionado en el servicio y localStorage
            this.camionService.setCamionSeleccionado(camionActualizado);
            this.procesarMantenciones();
            console.log('Camión actualizado después de completar mantención:', camionActualizado);
          },
          error: (error) => {
            console.error('Error al recargar camión después de completar mantención:', error);
            // Aún así procesar las mantenciones con los datos actuales
            this.procesarMantenciones();
          }
        });
      },
      error: (err) => {
        console.error('Error al completar mantención:', err);
        alert('Error al marcar la mantención como completada');
      }
    });
  }
}
