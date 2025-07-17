import { Component, inject, OnInit } from "@angular/core";
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
export class MantencionesPendientesComponent implements OnInit {
  camionService = inject(CamionService);
  http = inject(HttpClient);

  camion: Camion | null = null;
  mantencionesPendientes: any[] = [];
  mantencionesProximas: any[] = [];

  ngOnInit() {
    this.camionService.camionSeleccionado$.subscribe((camion) => {
      this.camion = camion;
      this.procesarMantenciones();
    });
  }

  procesarMantenciones() {
    if (!this.camion) return;

    const kmActual = this.camion.kilometraje;
    const hoy = new Date();

    this.mantencionesPendientes = [];
    this.mantencionesProximas = [];

    (this.camion as any).mantenciones?.forEach((mantencion: any) => {
      // Adaptar los datos al modelo visual esperado
      const mapeada = {
        ...mantencion,
        tipo: mantencion.tipo || 'General', // Valor por defecto
        criticidad: kmActual >= (mantencion.proximoKilometraje ?? 0) ? 'Alta' : 'Baja', // Ejemplo de criticidad
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
        this.camionService.obtenerCamion(this.camion?.patente!).subscribe((camionActualizado) => {
          this.camion = camionActualizado;
          this.procesarMantenciones();
        });
      },
      error: (err) => {
        console.error('Error al completar mantención:', err);
        alert('Error al marcar la mantención como completada');
      }
    });
  }
}
