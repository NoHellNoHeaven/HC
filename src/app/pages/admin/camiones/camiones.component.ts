import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CamionService, Camion } from '../../../servicios/camion.service';

interface Mantencion {
  nombre: string;
  accion: string[];
  accionSeleccionada?: string;
  kilometraje?: number;
  meses?: number;
}

@Component({
  selector: 'app-camiones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './camiones.component.html', 
  styleUrls: ['./camiones.component.css'], 
})
export class CamionesComponent {
  private camionService = inject(CamionService);

  camion: Partial<Camion> = {};
  tipoVehiculo: string[] = ['Camión', 'Camioneta', 'Pickup'];
  tiposSello: string[] = ['Verde', 'Rojo'];
  tiposCombustible: string[] = ['Diésel', 'Gasolina', 'Eléctrico'];
  currentYear = new Date().getFullYear();

  activeTab: 'vehicle' | 'maintenance' = 'vehicle';
  isSubmitting = false;
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  mantenciones: Mantencion[] = [
    { nombre: 'Cambio de aceite', accion: ['Cambiar', 'Revisar'] },
    { nombre: 'Filtro de aire', accion: ['Reemplazar', 'Limpiar'] },
    { nombre: 'Revisión técnica', accion: ['Agendar', 'Realizar'] },
    { nombre: 'Neumáticos', accion: ['Revisar', 'Rotar', 'Cambiar'] },
  ];

  setActiveTab(tab: 'vehicle' | 'maintenance') {
    this.activeTab = tab;
  }

  isBasicFormComplete(): boolean {
    const c = this.camion;
    return !!c.patente &&
           !!c.tipoCamion &&
           !!c.marca &&
           !!c.modelo &&
           !!c.anio &&
           !!c.color &&
           !!c.nroMotor &&
           !!c.nroChasis &&
           !!c.fabrica &&
           !!c.procedencia &&
           !!c.tipoSello &&
           !!c.combustible &&
           !!c.kilometraje &&
           !!c.fRevisionTecnica;
  }

  areAllMaintenancesComplete(): boolean {
    return this.mantenciones.every(m => m.accionSeleccionada && m.kilometraje);
  }

  getCompletedMaintenances(): number {
    return this.mantenciones.filter(m => m.accionSeleccionada && m.kilometraje).length;
  }

  canRegisterTruck(): boolean {
    return this.isBasicFormComplete() && this.areAllMaintenancesComplete();
  }

  enviarFormulario() {
    if (!this.canRegisterTruck()) return;

    this.isSubmitting = true;

    const datosCamion = {
      ...this.camion,
      mantenciones: this.mantenciones,
    };

    this.camionService.crearCamion(datosCamion as Camion).subscribe({
      next: () => {
        this.showToastMessage('Camión registrado exitosamente', 'success');
        this.resetForm();
        this.isSubmitting = false;
      },
      error: (err) => {
        this.showToastMessage('Error al registrar camión: ' + this.obtenerMensajeError(err), 'error');
        this.isSubmitting = false;
      },
    });
  }

  resetForm() {
    this.camion = {};
    this.mantenciones.forEach(m => {
      delete m.accionSeleccionada;
      delete m.kilometraje;
      delete m.meses;
    });
    this.activeTab = 'vehicle';
  }

  showToastMessage(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => (this.showToast = false), 4000);
  }

  obtenerMensajeError(error: any): string {
    if (!error) return 'Error desconocido';
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.error && typeof error.error === 'string') return error.error;
    return 'Error inesperado';
  }
}
