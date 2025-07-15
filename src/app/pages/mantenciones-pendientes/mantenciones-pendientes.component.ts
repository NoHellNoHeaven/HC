import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CamionService, Camion } from "../../servicios/camion.service";

@Component({
  selector: "app-mantenciones-pendientes",
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Mantenciones Pendientes para Camión: {{ camion?.patente || 'Ninguno seleccionado' }}</h2>

    <div *ngIf="!camion">Seleccione un camión para ver sus mantenciones</div>

    <div *ngIf="camion">
      <h3>Mantenciones Pendientes</h3>
      <ul>
        <li *ngFor="let m of mantencionesPendientes">
          {{ m.nombre }} - Accion: {{ m.accionSeleccionada }} - Próximo KM: {{ m.proximoKilometraje }} - Meses: {{ m.meses }}
        </li>
      </ul>

      <h3>Mantenciones Próximas</h3>
      <ul>
        <li *ngFor="let m of mantencionesProximas">
          {{ m.nombre }} - Próximo KM: {{ m.proximoKilometraje }} - Meses: {{ m.meses }}
        </li>
      </ul>
    </div>
  `,
})
export class MantencionesPendientesComponent implements OnInit {
  camionService = inject(CamionService);

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
      const proximoKm = mantencion.proximoKilometraje ?? 0;
      const meses = mantencion.meses ?? 0;

      let fechaVencimiento: Date | null = null;
      if (meses > 0) {
        const fechaBase = new Date();
        fechaBase.setDate(1);
        fechaVencimiento = new Date(fechaBase);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + meses);
      }

      const vencida = kmActual >= proximoKm || (fechaVencimiento !== null && fechaVencimiento <= hoy);

      if (vencida) {
        this.mantencionesPendientes.push(mantencion);
      } else {
        this.mantencionesProximas.push(mantencion);
      }
    });
  }
}
