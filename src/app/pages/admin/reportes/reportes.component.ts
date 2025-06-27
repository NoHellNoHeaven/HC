import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importa FormsModule
import { NavbarComponent } from "../../navbar/navbar.component";

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent], // Añade FormsModule aquí
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent {
  reportes = [
    {
      titulo: 'Problema en frenos delanteros', codigo: 'T-001 - ABC-123', descripcion: 'Los frenos delanteros hacen ruido y la respuesta es lenta',
      estado: 'Urgente',
      conductor: 'Juan Pérez', ubicacion: 'Almacén Central, Ciudad de México',
      fecha: '14/1/2024', kilometraje: '125.000 km'
    },
    {
      titulo: 'Accidente menor en estacionamiento', codigo: 'T-002 - DEF-456', descripcion: 'Rayón en la puerta lateral derecha al maniobrar',
      estado: 'En Progreso',
      conductor: 'María González', ubicacion: 'Centro de Distribución Norte',
      fecha: '13/1/2024', kilometraje: '98.000 km'
    },
    {
      titulo: 'Inspección mensual completada', codigo: 'T-003 - GHI-789', descripcion: 'Revisión general del vehículo - Todo en orden',
      estado: 'Completado',
      conductor: 'Carlos Rodríguez', ubicacion: 'Taller Principal',
      fecha: '12/1/2024', kilometraje: '87.500 km'
    },
    {
      titulo: 'Consumo elevado de combustible', codigo: 'T-004 - JKL-012', descripcion: 'El camión está consumiendo más combustible de lo normal',
      estado: 'Pendiente',
      conductor: 'Ana Martínez', ubicacion: 'Ruta México-Guadalajara',
      fecha: '11/1/2024', kilometraje: '156.000 km'
    },
  ];

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
      kilometraje: formData.kilometraje
    });
    this.cerrarFormulario();
  }
}
