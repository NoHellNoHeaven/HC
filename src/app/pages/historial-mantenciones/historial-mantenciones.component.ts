import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { HistorialMantencionesService, HistorialMantencion } from '../../services/historial-mantenciones.service';

@Component({
  selector: 'app-historial-mantenciones',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './historial-mantenciones.component.html',
  styleUrls: ['./historial-mantenciones.component.css']
})
export class HistorialMantencionesComponent implements OnInit, OnDestroy {
  historialCompleto: HistorialMantencion[] = [];
  historialFiltrado: HistorialMantencion[] = [];
  filtroCamion: string = '';
  filtroMantencion: string = '';
  camionesDisponibles: string[] = [];
  mantencionesDisponibles: string[] = [];
  ordenFecha: string = 'descendente';
  isLoading: boolean = false;
  error: string = '';

  constructor(
    private router: Router,
    private historialService: HistorialMantencionesService
  ) {}

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
    this.isLoading = true;
    this.error = '';
    
    this.historialService.obtenerHistorialCompleto().subscribe({
      next: (data) => {
        this.historialCompleto = data;
        this.aplicarFiltros();
        this.generarFiltros();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar historial:', error);
        this.error = 'Error al cargar el historial de mantenciones';
        this.isLoading = false;
      }
    });
  }

  generarFiltros() {
    // Obtener camiones únicos (marca + modelo)
    this.camionesDisponibles = [...new Set(
      this.historialCompleto.map(item => `${item.camionMarca} ${item.camionModelo}`)
    )];
    
    // Obtener tipos de mantención únicos
    this.mantencionesDisponibles = [...new Set(
      this.historialCompleto.map(item => item.mantencionNombre)
    )];
  }

  aplicarFiltros() {
    let filtrado = this.historialCompleto.filter(item => {
      const camionCompleto = `${item.camionMarca} ${item.camionModelo}`;
      const cumpleCamion = !this.filtroCamion || camionCompleto === this.filtroCamion;
      const cumpleMantencion = !this.filtroMantencion || item.mantencionNombre === this.filtroMantencion;
      return cumpleCamion && cumpleMantencion;
    });

    // Aplicar ordenamiento
    this.historialFiltrado = this.ordenarPorFecha(filtrado);
  }

  ordenarPorFecha(datos: HistorialMantencion[]): HistorialMantencion[] {
    return datos.sort((a, b) => {
      const fechaA = new Date(a.fechaRealizada);
      const fechaB = new Date(b.fechaRealizada);
      
      if (this.ordenFecha === 'ascendente') {
        return fechaA.getTime() - fechaB.getTime();
      } else {
        return fechaB.getTime() - fechaA.getTime();
      }
    });
  }

  aplicarOrdenamiento() {
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.filtroCamion = '';
    this.filtroMantencion = '';
    this.aplicarFiltros();
  }

  volverAHome() {
    this.router.navigate(['/home']);
  }

  eliminarRegistro(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
      this.historialService.eliminarRegistro(id).subscribe({
        next: () => {
          // Recargar el historial después de eliminar
          this.cargarHistorialCompleto();
        },
        error: (error) => {
          console.error('Error al eliminar registro:', error);
          alert('Error al eliminar el registro');
        }
      });
    }
  }

  exportarHistorial() {
    const filtros: any = {};
    if (this.filtroCamion) {
      const [marca, modelo] = this.filtroCamion.split(' ');
      filtros.marca = marca;
      filtros.modelo = modelo;
    }
    if (this.filtroMantencion) {
      filtros.tipoMantencion = this.filtroMantencion;
    }

    this.historialService.exportarHistorialCSV(filtros).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'historial_mantenciones.csv';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error al exportar CSV:', error);
        // Fallback: exportar datos filtrados localmente
        this.exportarHistorialLocal();
      }
    });
  }

  exportarHistorialLocal() {
    const datos = this.historialFiltrado.map(item => ({
      Fecha: new Date(item.fechaRealizada).toLocaleString('es-ES'),
      Camión: `${item.camionMarca} ${item.camionModelo}`,
      Patente: item.camionPatente,
      Mantención: item.mantencionNombre,
      Acción: item.mantencionAccion,
      Kilometraje: item.kilometrajeRealizado
    }));

    const csv = this.convertirACSV(datos);
    this.descargarCSV(csv, 'historial_mantenciones.csv');
  }

  convertirACSV(datos: any[]): string {
    if (datos.length === 0) return '';
    
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

  // Método para formatear fecha en el template
  formatearFecha(fecha: string): string {
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  // Método para obtener solo la fecha
  obtenerSoloFecha(fecha: string): string {
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES');
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  // Método para obtener solo la hora
  obtenerSoloHora(fecha: string): string {
    try {
      const date = new Date(fecha);
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Hora inválida';
    }
  }
} 