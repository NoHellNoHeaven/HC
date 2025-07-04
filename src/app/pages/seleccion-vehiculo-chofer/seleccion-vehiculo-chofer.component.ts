import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CamionService } from '../../servicios/camion.service';
import { NavbarComponent } from "../navbar/navbar.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seleccion-vehiculo-chofer',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, ReactiveFormsModule, CommonModule ],
  templateUrl: './seleccion-vehiculo-chofer.component.html',
  styleUrls: ['./seleccion-vehiculo-chofer.component.css'],
  encapsulation: ViewEncapsulation.None,
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
  //API DE MENSAJERIA WHATSAPP
  enviarWhatsApp(mensaje: string) {
    const telefono = '56948859245'; // sin +
    const apikey = '4730094';
    const url = `https://api.callmebot.com/whatsapp.php?phone=${telefono}&text=${encodeURIComponent(mensaje)}&apikey=${apikey}`;

    fetch(url)
      .then(response => response.text())
      .then(data => console.log('✅ WhatsApp enviado:', data))
      .catch(error => console.error('❌ Error al enviar WhatsApp:', error));
  }

  enviarWhatsapp2(mensaje: string) {
  const telefono = '56942026558'; // Número sin el signo +
  const apikey = '4003809';
  const url = `https://api.callmebot.com/whatsapp.php?phone=${telefono}&text=${encodeURIComponent(mensaje)}&apikey=${apikey}`;

  fetch(url)
    .then(response => response.text())
    .then(data => console.log('📲 WhatsApp 2 enviado:', data))
    .catch(error => console.error('❌ Error al enviar WhatsApp 2:', error));
}
  //API DE MENSAJERIA WHATSAPP


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
      // Actualiza el kilometraje del camión seleccionado
      this.camionesLocales[index].kilometraje_camion = this.nuevoKilometraje;

      // Actualiza el estado de mantenciones (vencidas o no) con el nuevo kilometraje
      this.camionesLocales[index].mantenciones = this.camionesLocales[index].mantenciones.map((m: any) => {
        const proximoKm = Number(m.proximoKilometraje);
        const fechaBase = new Date(this.camionesLocales[index].fecha_revision_tecnica + '-01');
        const fechaVencimiento = new Date(fechaBase);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + Number(m.meses));

        const vencida = this.nuevoKilometraje! >= proximoKm || fechaVencimiento <= new Date();

        return { ...m, vencida };
      });

      // Guarda el array completo actualizado en localStorage bajo 'camiones'
      localStorage.setItem('camiones', JSON.stringify(this.camionesLocales));

      // --- NUEVO: sincroniza el camión seleccionado actualizado en localStorage
      // Guarda el camión actualizado bajo la clave 'camionSeleccionado' (para el servicio)
      localStorage.setItem('camionSeleccionado', JSON.stringify(this.camionesLocales[index]));

      // Actualiza el BehaviorSubject en el servicio para que otros componentes se enteren
      this.camionDataService.setCamionSeleccionado(this.camionesLocales[index]);

      // Mensajes de mantenciones vencidas o éxito
      const vencidas = this.camionesLocales[index].mantenciones
        .filter((m: any) => m.vencida)
        .map((m: any) => `${m.nombre} (programado para ${m.proximoKilometraje} km)`);

      if (vencidas.length > 0) {
        const mensajeWhatsApp = `⚠️ Alerta: Mantenciones vencidas en el camión *${this.camionesLocales[index].patente}*.\nKilometraje actual: *${this.nuevoKilometraje}* km\n\nMantenciones vencidas:\n${vencidas.join('\n')}`;
        this.enviarWhatsApp(mensajeWhatsApp);
        this.enviarWhatsapp2(mensajeWhatsApp);
        alert(`⚠️ Atención: Estas mantenciones ya vencieron:\n\n${vencidas.join('\n')}`);
      } else {
        alert("✅ Kilometraje actualizado correctamente");
      }


      // Navega a la pantalla de mantenciones pendientes
      this.router.navigate(['/mantenciones-pendientes']);
    }

    this.cerrarModal();
  }

  getExpiredMaintenanceCount(camion: any): number {
    return camion.mantenciones.filter((m: any) => m.vencida).length;
  }
}
