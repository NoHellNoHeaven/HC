import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CamionService } from '../../servicios/camion.service';
import { NavbarComponent } from "../navbar/navbar.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seleccion-vehiculo-chofer',
  imports: [NgIf, NgFor, FormsModule, ReactiveFormsModule, NavbarComponent, CommonModule ],
  templateUrl: './seleccion-vehiculo-chofer.component.html',
  styleUrls: ['./seleccion-vehiculo-chofer.component.scss']
})
export class SeleccionVehiculoChoferComponent implements OnInit {
  camionesLocales: any[] = [];
  camionSeleccionado: any = null;
  nuevoKilometraje: number | null = null;
  errorMessage: string = "";

  constructor(
    private router: Router,
    private camionDataService: CamionService
  ) {}

  ngOnInit() {
    this.camionesLocales = this.obtenerCamionesLocales();
  }

  obtenerCamionesLocales(): any[] {
    return JSON.parse(localStorage.getItem('camiones') || '[]');
  }

  seleccionarCamion(camion: any) {
    this.camionSeleccionado = { ...camion };
    this.nuevoKilometraje = camion.kilometraje_camion;
    this.errorMessage = "";
  }

  cerrarModal() {
    this.camionSeleccionado = null;
    this.nuevoKilometraje = null;
    this.errorMessage = "";
  }

  guardarKilometraje() {
    if (this.nuevoKilometraje == null || this.nuevoKilometraje < 0) {
      this.errorMessage = 'Por favor ingresa un kilometraje válido.';
      return;
    }

    if (this.nuevoKilometraje < this.camionSeleccionado.kilometraje_camion) {
      this.errorMessage = 'El nuevo kilometraje no puede ser menor al actual.';
      return;
    }

    const index = this.camionesLocales.findIndex(
      c => c.patente === this.camionSeleccionado.patente
    );

    if (index !== -1) {
      this.camionesLocales[index].kilometraje_camion = this.nuevoKilometraje;

      this.camionesLocales[index].mantenciones = this.camionesLocales[index].mantenciones.map((m: any) => {
        const proximoKm = Number(m.proximoKilometraje);
        const fechaBase = new Date(this.camionesLocales[index].fecha_revision_tecnica + '-01');
        const fechaVencimiento = new Date(fechaBase);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + Number(m.meses));

        const vencida = this.nuevoKilometraje! >= proximoKm || fechaVencimiento <= new Date();

        return { ...m, vencida };
      });

      localStorage.setItem('camiones', JSON.stringify(this.camionesLocales));

      const vencidas = this.camionesLocales[index].mantenciones
        .filter((m: any) => m.vencida)
        .map((m: any) => `${m.nombre} (programado para ${m.proximoKilometraje} km)`);

      if (vencidas.length > 0) {
        alert(`⚠️ Atención: Estas mantenciones ya vencieron:\n\n${vencidas.join('\n')}`);
      } else {
        alert("✅ Kilometraje actualizado correctamente");
      }

      this.camionDataService.setCamionSeleccionado(this.camionesLocales[index]);
      this.router.navigate(['/mantenciones-pendientes']);
    }

    this.cerrarModal();
  }

  getExpiredMaintenanceCount(camion: any): number {
    return camion.mantenciones.filter((m: any) => m.vencida).length;
  }
}
