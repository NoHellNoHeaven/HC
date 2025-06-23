import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { CamionService } from '../../../servicios/camion.service';
import { NavbarComponent } from "../../navbar/navbar.component"; // Asegúrate que la ruta sea correcta

@Component({
  selector: 'app-camiones',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, NavbarComponent],
  templateUrl: './camiones.component.html',
  styleUrls: ['./camiones.component.css']
})
export class CamionesComponent {
  camionService = inject(CamionService);

  camion = {
    patente: '',
    tipo_vehiculo: '',
    marca: '',
    modelo: '',
    anno: '',
    color: '',
    nro_motor: '',
    nro_chasis: '',
    fabricante: '',
    procedencia: '',
    tipo_sello: '',
    combustible: '',
    kilometraje_camion: '',
    fecha_revision_tecnica: ''
  };

  tipoVehiculo = [
    'Camión', 'Camioneta', 'Furgón', 'Sedán', 'Hatchback', 'SUV', 'Coupé',
    'Convertible', 'Pickup', 'Minivan', 'Crossover', 'Station Wagon',
    'Microbús', 'Autobús', 'Motocicleta', 'Tractor', 'Remolque', 'Ambulancia',
    'Grúa', 'Tractor agrícola', 'Limusina', 'Deportivo'
  ];
  tiposCombustible = ['93', '95', '97', 'Diesel'];
  tiposSello = ['Verde', 'Rojo', 'Azul'];
  currentYear: number = new Date().getFullYear();

  mantenciones = [
    { nombre: 'Aceite de motor', accion: ['Cambiar'], accionSeleccionada: '', kilometraje: null, meses: null },
    { nombre: 'Filtro de aire', accion: ['Limpiar', 'Cambiar'], accionSeleccionada: '', kilometraje: null, meses: null },
    { nombre: 'Revisión de frenos', accion: ['Revisar'], accionSeleccionada: '', kilometraje: null, meses: null },
    { nombre: 'Reemplazo de neumáticos', accion: ['Reemplazar'], accionSeleccionada: '', kilometraje: null, meses: null },
    { nombre: 'Revisión de tren delantero', accion: ['Revisar'], accionSeleccionada: '', kilometraje: null, meses: null }
  ];

  // Método que se llama al enviar el formulario
  enviarFormulario() {
    if (!this.camion.patente) {
      alert('La patente es obligatoria');
      return;
    }

    // Convertir el kilometraje actual a número para realizar los cálculos
    const currentKm = Number(this.camion.kilometraje_camion);

    // Creamos el objeto del camión con los datos introducidos
    const datosCamion = {
      patente: this.camion.patente,
      tipo: this.camion.tipo_vehiculo,
      marca: this.camion.marca,
      modelo: this.camion.modelo,
      anno: this.camion.anno,
      color: this.camion.color,
      nro_motor: this.camion.nro_motor,
      nro_chasis: this.camion.nro_chasis,
      fabricante: this.camion.fabricante,
      procedencia: this.camion.procedencia,
      tipo_sello: this.camion.tipo_sello,
      combustible: this.camion.combustible,
      kilometraje_camion: this.camion.kilometraje_camion,
      fecha_revision_tecnica: this.camion.fecha_revision_tecnica,

      // Se filtran las mantenciones con datos completos y se calcula el proximo kilometraje
      mantenciones: this.mantenciones
        .filter(m => m.accionSeleccionada && m.kilometraje && m.meses)
        .map(m => ({
          nombre: m.nombre,
          accion: m.accionSeleccionada,
          kilometraje: m.kilometraje,
          meses: m.meses,
          proximoKilometraje: currentKm + Number(m.kilometraje)
        }))
    };

    // Llamamos al servicio para crear el camión
    this.camionService.crearCamion(datosCamion).subscribe({
      next: (respuesta) => {
        alert('Camión guardado en la base de datos ✅');
        console.log(respuesta);
        // Reset del formulario después de un éxito
        this.resetFormulario();
      },
      error: (error) => {
        console.error('Error al guardar camión:', error);
        alert('Error al guardar camión 🚫');
        // Guarda localmente cuando el backend no responda
        this.guardarCamionLocal(datosCamion);
      }
    });
  }

  // Método para resetear el formulario
  resetFormulario() {
    this.camion = {
      patente: '',
      tipo_vehiculo: '',
      marca: '',
      modelo: '',
      anno: '',
      color: '',
      nro_motor: '',
      nro_chasis: '',
      fabricante: '',
      procedencia: '',
      tipo_sello: '',
      combustible: '',
      kilometraje_camion: '',
      fecha_revision_tecnica: ''
    };

    this.mantenciones = [
      { nombre: 'Aceite de motor', accion: ['Cambiar'], accionSeleccionada: '', kilometraje: null, meses: null },
      { nombre: 'Filtro de aire', accion: ['Limpiar', 'Cambiar'], accionSeleccionada: '', kilometraje: null, meses: null },
      { nombre: 'Revisión de frenos', accion: ['Revisar'], accionSeleccionada: '', kilometraje: null, meses: null },
      { nombre: 'Reemplazo de neumáticos', accion: ['Reemplazar'], accionSeleccionada: '', kilometraje: null, meses: null },
      { nombre: 'Revisión de tren delantero', accion: ['Revisar'], accionSeleccionada: '', kilometraje: null, meses: null }
    ];
  }

  /* ===============================================================
   ==========  ALMACENAMIENTO LOCAL – SÓLO PARA TESTEO  ==========
   =============================================================== */

  /**
   * Guarda un camión en localStorage bajo la clave "camiones".
   * Si la clave no existe, la crea.
   */
  guardarCamionLocal(camion: any): void {
    const camionesGuardados: any[] = JSON.parse(localStorage.getItem('camiones') || '[]');
    camionesGuardados.push(camion);
    localStorage.setItem('camiones', JSON.stringify(camionesGuardados));
  }

  /**
   * Devuelve el arreglo de camiones guardados localmente.
   * Útil para mostrarlos en la interfaz cuando no hay backend.
   */
  obtenerCamionesLocales(): any[] {
    return JSON.parse(localStorage.getItem('camiones') || '[]');
  }
}