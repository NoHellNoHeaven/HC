import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { CamionService, Camion } from "../../../servicios/camion.service";

@Component({
  selector: "app-camiones",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Gestión de Camiones</h2>

    <form (ngSubmit)="guardarCamion()" #form="ngForm" novalidate>
      <input
        [(ngModel)]="camion.patente"
        name="patente"
        placeholder="Patente"
        required
        [readonly]="editando"
        #patente="ngModel"
      />
      <div *ngIf="patente.invalid && patente.touched" class="error">Patente es obligatoria</div>

      <input
        [(ngModel)]="camion.tipoCamion"
        name="tipoCamion"
        placeholder="Tipo Camión"
        required
        #tipoCamion="ngModel"
      />
      <div *ngIf="tipoCamion.invalid && tipoCamion.touched" class="error">Tipo de Camión es obligatorio</div>

      <input
        [(ngModel)]="camion.marca"
        name="marca"
        placeholder="Marca"
        required
        #marca="ngModel"
      />
      <div *ngIf="marca.invalid && marca.touched" class="error">Marca es obligatoria</div>

      <input
        [(ngModel)]="camion.modelo"
        name="modelo"
        placeholder="Modelo"
        required
        #modelo="ngModel"
      />
      <div *ngIf="modelo.invalid && modelo.touched" class="error">Modelo es obligatorio</div>

      <input
        [(ngModel)]="camion.anio"
        name="anio"
        type="number"
        placeholder="Año"
        required
        min="1900"
        max="2100"
        #anio="ngModel"
      />
      <div *ngIf="anio.invalid && anio.touched" class="error">Año válido es obligatorio</div>

      <input
        [(ngModel)]="camion.color"
        name="color"
        placeholder="Color"
        required
        #color="ngModel"
      />
      <div *ngIf="color.invalid && color.touched" class="error">Color es obligatorio</div>

      <input
        [(ngModel)]="camion.nroMotor"
        name="nroMotor"
        placeholder="Nro Motor"
        required
        #nroMotor="ngModel"
      />
      <div *ngIf="nroMotor.invalid && nroMotor.touched" class="error">Nro Motor es obligatorio</div>

      <input
        [(ngModel)]="camion.nroChasis"
        name="nroChasis"
        placeholder="Nro Chasis"
        required
        #nroChasis="ngModel"
      />
      <div *ngIf="nroChasis.invalid && nroChasis.touched" class="error">Nro Chasis es obligatorio</div>

      <input
        [(ngModel)]="camion.fabrica"
        name="fabrica"
        placeholder="Fabrica"
        required
        #fabrica="ngModel"
      />
      <div *ngIf="fabrica.invalid && fabrica.touched" class="error">Fabricante es obligatorio</div>

      <input
        [(ngModel)]="camion.procedencia"
        name="procedencia"
        placeholder="Procedencia"
        required
        #procedencia="ngModel"
      />
      <div *ngIf="procedencia.invalid && procedencia.touched" class="error">Procedencia es obligatoria</div>

      <input
        [(ngModel)]="camion.tipoSello"
        name="tipoSello"
        placeholder="Tipo Sello"
        required
        #tipoSello="ngModel"
      />
      <div *ngIf="tipoSello.invalid && tipoSello.touched" class="error">Tipo Sello es obligatorio</div>

      <input
        [(ngModel)]="camion.combustible"
        name="combustible"
        placeholder="Combustible"
        required
        #combustible="ngModel"
      />
      <div *ngIf="combustible.invalid && combustible.touched" class="error">Combustible es obligatorio</div>

      <input
        [(ngModel)]="camion.kilometraje"
        name="kilometraje"
        type="number"
        placeholder="Kilometraje"
        required
        min="0"
        #kilometraje="ngModel"
      />
      <div *ngIf="kilometraje.invalid && kilometraje.touched" class="error">Kilometraje válido es obligatorio</div>

      <input
        [(ngModel)]="camion.fRevisionTecnica"
        name="fRevisionTecnica"
        type="date"
        placeholder="Fecha Revisión Técnica"
        required
        #fRevisionTecnica="ngModel"
      />
      <div *ngIf="fRevisionTecnica.invalid && fRevisionTecnica.touched" class="error">Fecha Revisión Técnica es obligatoria</div>

      <input
        [(ngModel)]="camion.fVencimientoSeguro"
        name="fVencimientoSeguro"
        type="date"
        placeholder="Fecha Venc. Seguro"
        required
        #fVencimientoSeguro="ngModel"
      />
      <div *ngIf="fVencimientoSeguro.invalid && fVencimientoSeguro.touched" class="error">Fecha Vencimiento Seguro es obligatoria</div>

      <input
        [(ngModel)]="camion.permisoCirculacion"
        name="permisoCirculacion"
        type="date"
        placeholder="Permiso Circulación"
        required
        #permisoCirculacion="ngModel"
      />
      <div *ngIf="permisoCirculacion.invalid && permisoCirculacion.touched" class="error">Permiso Circulación es obligatorio</div>

      <button type="submit" [disabled]="form.invalid || isSubmitting">
        {{ editando ? 'Actualizar' : 'Crear' }} Camión
      </button>
      <button type="button" (click)="cancelarEdicion()" *ngIf="editando" [disabled]="isSubmitting">
        Cancelar
      </button>
    </form>

    <hr />

    <h3>Listado de Camiones</h3>
    <ul>
      <li *ngFor="let c of camiones">
        <strong>{{ c.patente }}</strong> - {{ c.marca }} {{ c.modelo }} ({{ c.anio }})
        <button (click)="editarCamion(c)" [disabled]="isSubmitting">Editar</button>
        <button (click)="eliminarCamion(c.patente)" [disabled]="isSubmitting">Eliminar</button>
      </li>
    </ul>
  `,
  styles: [
    `.error { color: red; font-size: 0.85em; margin-bottom: 5px; }`,
    `form input, form select { display: block; margin-bottom: 10px; padding: 6px; width: 100%; max-width: 300px; }`,
    `button { margin-right: 8px; padding: 6px 12px; }`,
  ]
})
export class CamionesComponent {
  camionService = inject(CamionService);
  camiones: Camion[] = [];

  camion: Partial<Camion> = {};
  editando = false;
  isSubmitting = false;

  constructor() {
    this.cargarCamiones();
  }

  cargarCamiones() {
    this.camionService.obtenerCamiones().subscribe({
      next: (data) => (this.camiones = data),
      error: (err) => {
        console.warn('Error al cargar camiones desde API, cargando localStorage.', err);
        this.camiones = this.camionService.getCamionesLocal();
      },
    });
  }

  guardarCamion() {
    if (!this.validarFormulario()) {
      alert('Por favor, completa todos los campos obligatorios y válidos');
      return;
    }

    this.isSubmitting = true;

    if (this.editando) {
      this.camionService.actualizarCamion(this.camion.patente!, this.camion).subscribe({
        next: (actualizado) => {
          this.actualizarLocalCamiones(actualizado);
          this.resetFormulario();
          this.isSubmitting = false;
          alert('Camión actualizado correctamente');
        },
        error: (err) => {
          this.isSubmitting = false;
          alert('Error al actualizar camión: ' + this.obtenerMensajeError(err));
        },
      });
    } else {
      this.camionService.crearCamion(this.camion as Camion).subscribe({
        next: (creado) => {
          this.camiones.push(creado);
          this.camionService.setCamionesLocal(this.camiones);
          this.resetFormulario();
          this.isSubmitting = false;
          alert('Camión creado correctamente');
        },
        error: (err) => {
          this.isSubmitting = false;
          alert('Error al crear camión: ' + this.obtenerMensajeError(err));
        },
      });
    }
  }

  editarCamion(c: Camion) {
    this.camion = { ...c };
    this.editando = true;
  }

  cancelarEdicion() {
    this.resetFormulario();
  }

  eliminarCamion(patente: string) {
    if (!confirm('¿Eliminar camión?')) return;

    this.isSubmitting = true;
    this.camionService.eliminarCamion(patente).subscribe({
      next: () => {
        this.camiones = this.camiones.filter((c) => c.patente !== patente);
        this.camionService.setCamionesLocal(this.camiones);
        this.isSubmitting = false;
        alert('Camión eliminado correctamente');
      },
      error: (err) => {
        this.isSubmitting = false;
        alert('Error al eliminar camión: ' + this.obtenerMensajeError(err));
      },
    });
  }

  resetFormulario() {
    this.camion = {};
    this.editando = false;
  }

  actualizarLocalCamiones(camionActualizado: Camion) {
    const index = this.camiones.findIndex((c) => c.patente === camionActualizado.patente);
    if (index !== -1) {
      this.camiones[index] = camionActualizado;
      this.camionService.setCamionesLocal(this.camiones);
    }
  }

  validarFormulario(): boolean {
    // Validar sólo los campos clave para simplificar
    const c = this.camion;
    return (
      !!c.patente &&
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
      c.kilometraje !== undefined &&
      !!c.fRevisionTecnica &&
      !!c.fVencimientoSeguro &&
      !!c.permisoCirculacion
    );
  }

  obtenerMensajeError(error: any): string {
    if (!error) return 'Error desconocido';
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.error && typeof error.error === 'string') return error.error;
    return 'Error inesperado';
  }
}
