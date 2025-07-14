import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-historial-mantenciones',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './historial-mantenciones.component.html',
  styleUrls: ['./historial-mantenciones.component.css']
})
export class HistorialMantencionesComponent implements OnInit, OnDestroy {
  historialCompleto: any[] = [];
  filtroCamion: string = '';
  filtroMantencion: string = '';
  camionesDisponibles: string[] = [];
  mantencionesDisponibles: string[] = [];
  ordenFecha: string = 'descendente';

  constructor(private router: Router) {}

  ngOnInit() {
    this.cargarHistorialCompleto();
    
    // Actualizar cuando la ventana vuelve a estar activa
    window.addEventListener('focus', () => {
      this.cargarHistorialCompleto();
    });
  }

  ngOnDestroy() {
    // Remover el event listener
    window.removeEventListener('focus', () => {
      this.cargarHistorialCompleto();
    });
  }

  cargarHistorialCompleto() {
    this.historialCompleto = [];
    
    // Obtener datos originales de localStorage
    const camionesData = JSON.parse(localStorage.getItem('camiones') || '[]');
    
    if (camionesData.length === 0) {
      return;
    }
    
    // Procesar cada camión
    camionesData.forEach((camion: any) => {
      if (camion.historialMantenciones && camion.historialMantenciones.length > 0) {
        camion.historialMantenciones.forEach((mantencion: any) => {
          // Manejar diferentes formatos de fecha con hora
          let fechaFormateada = 'Fecha no disponible';
          try {
            if (mantencion.fechaRealizada) {
              const fecha = new Date(mantencion.fechaRealizada);
              fechaFormateada = fecha.toLocaleDateString('es-ES') + ' ' + fecha.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              });
            } else if (mantencion.fecha) {
              const fecha = new Date(mantencion.fecha);
              fechaFormateada = fecha.toLocaleDateString('es-ES') + ' ' + fecha.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              });
            }
          } catch (error) {
            console.error('Error al formatear fecha:', error);
            fechaFormateada = 'Fecha inválida';
          }
          
          const itemHistorial = {
            fecha: fechaFormateada,
            fechaOriginal: mantencion.fechaRealizada || mantencion.fecha,
            camion: `${camion.marca} ${camion.modelo}`,
            patente: camion.patente,
            nombre: mantencion.nombre,
            accion: mantencion.accion || 'Mantenimiento realizado',
            kilometraje: mantencion.kilometrajeRealizado || mantencion.kilometraje || 'N/A'
          };
          
          this.historialCompleto.push(itemHistorial);
        });
      }
    });
    
    // Ordenar por fecha y hora (más reciente primero)
    this.historialCompleto.sort((a, b) => {
      try {
        const fechaA = new Date(a.fechaOriginal);
        const fechaB = new Date(b.fechaOriginal);
        if (isNaN(fechaA.getTime()) || isNaN(fechaB.getTime())) {
          return 0;
        }
        return fechaB.getTime() - fechaA.getTime();
      } catch (error) {
        return 0;
      }
    });
    
    // Generar listas para filtros
    this.generarFiltros();
  }

  generarFiltros() {
    // Obtener camiones únicos
    this.camionesDisponibles = [...new Set(this.historialCompleto.map(item => item.camion))];
    
    // Obtener tipos de mantención únicos
    this.mantencionesDisponibles = [...new Set(this.historialCompleto.map(item => item.nombre))];
  }

  get historialFiltrado(): any[] {
    let filtrado = this.historialCompleto.filter(item => {
      const cumpleCamion = !this.filtroCamion || item.camion === this.filtroCamion;
      const cumpleMantencion = !this.filtroMantencion || item.nombre === this.filtroMantencion;
      return cumpleCamion && cumpleMantencion;
    });

    // Aplicar ordenamiento
    return this.ordenarPorFecha(filtrado);
  }

  ordenarPorFecha(datos: any[]): any[] {
    return datos.sort((a, b) => {
      try {
        const fechaA = new Date(a.fechaOriginal);
        const fechaB = new Date(b.fechaOriginal);
        
        if (isNaN(fechaA.getTime()) || isNaN(fechaB.getTime())) {
          return 0;
        }
        
        if (this.ordenFecha === 'ascendente') {
          return fechaA.getTime() - fechaB.getTime();
        } else {
          return fechaB.getTime() - fechaA.getTime();
        }
      } catch (error) {
        return 0;
      }
    });
  }

  aplicarOrdenamiento() {
    // El getter se actualiza automáticamente cuando cambia ordenFecha
    // Este método se puede usar para lógica adicional si es necesario
  }

  limpiarFiltros() {
    this.filtroCamion = '';
    this.filtroMantencion = '';
  }

  volverAHome() {
    this.router.navigate(['/home']);
  }

  exportarHistorial() {
    const datos = this.historialFiltrado.map(item => ({
      Fecha: item.fecha,
      Camión: item.camion,
      Patente: item.patente,
      Mantención: item.nombre,
      Acción: item.accion,
      Kilometraje: item.kilometraje
    }));

    const csv = this.convertirACSV(datos);
    this.descargarCSV(csv, 'historial_mantenciones.csv');
  }

  convertirACSV(datos: any[]): string {
    const headers = Object.keys(datos[0]);
    const csvContent = [
      headers.join(','),
      ...datos.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    return csvContent;
  }

  descargarCSV(csv: string, filename: string) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
} 