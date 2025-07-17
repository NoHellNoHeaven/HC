import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { HistorialMantencionesService, HistorialMantencion } from '../../services/historial-mantenciones.service';
import * as XLSX from 'xlsx';

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
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';
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
    )].sort();
    
    // Obtener tipos de mantención únicos
    this.mantencionesDisponibles = [...new Set(
      this.historialCompleto.map(item => item.mantencionNombre)
    )].sort();
  }

  aplicarFiltros() {
    console.log('Aplicando filtros:', { 
      filtroCamion: this.filtroCamion, 
      filtroMantencion: this.filtroMantencion,
      filtroFechaDesde: this.filtroFechaDesde,
      filtroFechaHasta: this.filtroFechaHasta,
      totalRegistros: this.historialCompleto.length 
    });

    let filtrado = this.historialCompleto.filter(item => {
      const camionCompleto = `${item.camionMarca} ${item.camionModelo}`;
      const cumpleCamion = !this.filtroCamion || camionCompleto === this.filtroCamion;
      const cumpleMantencion = !this.filtroMantencion || item.mantencionNombre === this.filtroMantencion;
      
      // Filtro por fecha
      let cumpleFecha = true;
      if (this.filtroFechaDesde || this.filtroFechaHasta) {
        const fechaItem = new Date(item.fechaRealizada);
        const fechaDesde = this.filtroFechaDesde ? new Date(this.filtroFechaDesde) : null;
        const fechaHasta = this.filtroFechaHasta ? new Date(this.filtroFechaHasta + 'T23:59:59') : null;
        
        if (fechaDesde && fechaItem < fechaDesde) {
          cumpleFecha = false;
        }
        if (fechaHasta && fechaItem > fechaHasta) {
          cumpleFecha = false;
        }
      }
      
      return cumpleCamion && cumpleMantencion && cumpleFecha;
    });

    console.log('Registros filtrados:', filtrado.length);

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

  // Métodos para manejar cambios en filtros
  onFiltroCamionChange() {
    this.aplicarFiltros();
  }

  onFiltroMantencionChange() {
    this.aplicarFiltros();
  }

  onFiltroFechaDesdeChange() {
    this.aplicarFiltros();
  }

  onFiltroFechaHastaChange() {
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.filtroCamion = '';
    this.filtroMantencion = '';
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
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



  exportarHistorialXLSX() {
    // Crear un archivo XLSX real usando la librería
    const datos = this.historialFiltrado.map(item => ({
      Fecha: new Date(item.fechaRealizada).toLocaleDateString('es-ES'),
      Hora: new Date(item.fechaRealizada).toLocaleTimeString('es-ES'),
      Camion: `${item.camionMarca} ${item.camionModelo}`,
      Patente: item.camionPatente,
      Mantencion: item.mantencionNombre,
      Accion: item.mantencionAccion,
      Kilometraje: item.kilometrajeRealizado
    }));

    // Crear el workbook y worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datos);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historial Mantenciones');

    // Generar el archivo
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    this.descargarXLSX(excelBuffer, 'historial_mantenciones.xlsx');
  }

  descargarXLSX(buffer: any, filename: string) {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
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