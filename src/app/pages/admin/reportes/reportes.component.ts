import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css'],
})
export class ReportesComponent {
  reportes = [
    {
      titulo: 'Problema en frenos delanteros',
      codigo: 'T-001 - ABC-123',
      descripcion: 'Los frenos delanteros hacen ruido y la respuesta es lenta',
      estado: 'Urgente',
      conductor: 'Juan Pérez',
      ubicacion: 'Almacén Central, Santiago',
      fecha: '2024-01-14',
      kilometraje: '125.000 km',
      tipo: 'Mecánico',
    },
    {
      titulo: 'Accidente menor en estacionamiento',
      codigo: 'T-002 - DEF-456',
      descripcion: 'Rayón en la puerta lateral derecha al maniobrar',
      estado: 'En Progreso',
      conductor: 'María González',
      ubicacion: 'Centro de Distribución Norte',
      fecha: '2024-01-13',
      kilometraje: '98.000 km',
      tipo: 'Eléctrico',
    },
    {
      titulo: 'Inspección mensual completada',
      codigo: 'T-003 - GHI-789',
      descripcion: 'Revisión general del vehículo - Todo en orden',
      estado: 'Completado',
      conductor: 'Carlos Rodríguez',
      ubicacion: 'Taller Principal',
      fecha: '2024-01-12',
      kilometraje: '87.500 km',
      tipo: 'Mecánico',
    },
    {
      titulo: 'Consumo elevado de combustible',
      codigo: 'T-004 - JKL-012',
      descripcion: 'El camión está consumiendo más combustible de lo normal',
      estado: 'Pendiente',
      conductor: 'Ana Martínez',
      ubicacion: 'Ruta Viña del mar - Santiago',
      fecha: '2024-01-11',
      kilometraje: '156.000 km',
      tipo: 'Eléctrico',
    },
  ];

  reportesFiltrados = [...this.reportes];

  filtroTexto: string = '';
  filtroEstado: string = '';
  filtroTipo: string = '';

  mostrarFormularioNuevo = false;

  nuevoReporte() {
    this.mostrarFormularioNuevo = true;
  }

  cerrarFormulario() {
    this.mostrarFormularioNuevo = false;
  }

  guardarReporte(formData: any) {
    this.reportes.push({
      titulo: formData.titulo,
      codigo: formData.codigo,
      descripcion: formData.descripcion,
      estado: formData.estado,
      conductor: formData.conductor,
      ubicacion: formData.ubicacion,
      fecha: formData.fecha,
      kilometraje: formData.kilometraje,
      tipo: formData.tipo,
    });
    this.aplicarFiltro();
    this.cerrarFormulario();
  }

  aplicarFiltro() {
    const texto = this.filtroTexto.toLowerCase();
    this.reportesFiltrados = this.reportes.filter((r) => {
      const textoCoincide =
        r.titulo.toLowerCase().includes(texto) ||
        r.conductor.toLowerCase().includes(texto) ||
        r.codigo.toLowerCase().includes(texto);

      const estadoCoincide = this.filtroEstado ? r.estado === this.filtroEstado : true;
      const tipoCoincide = this.filtroTipo ? r.tipo === this.filtroTipo : true;

      return textoCoincide && estadoCoincide && tipoCoincide;
    });
  }

  // Propiedades para los totales (para no usar filter() en template)
  get totalReportes(): number {
    return this.reportes.length;
  }

  get totalUrgentes(): number {
    return this.reportes.filter((r) => r.estado === 'Urgente').length;
  }

  get totalEnProgreso(): number {
    return this.reportes.filter((r) => r.estado === 'En Progreso').length;
  }

  get totalCompletados(): number {
    return this.reportes.filter((r) => r.estado === 'Completado').length;
  }
}
