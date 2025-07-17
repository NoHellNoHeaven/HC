import { Component, OnInit, ViewEncapsulation, OnDestroy, AfterViewInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CamionService } from '../../servicios/camion.service';
import { NavbarComponent } from "../navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-seleccion-vehiculo-chofer',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, ReactiveFormsModule, CommonModule, NavbarComponent ],
  templateUrl: './seleccion-vehiculo-chofer.component.html',
  styleUrls: ['./seleccion-vehiculo-chofer.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SeleccionVehiculoChoferComponent implements OnInit, OnDestroy, AfterViewInit {
  camiones: any[] = [];
  camionSeleccionado: any = null;
  nuevoKilometraje: number | null = null;
  errorMessage: string = "";
  private updateSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private camionDataService: CamionService
  ) {}

  ngOnInit() {
    this.cargarCamionesDesdeBD();
    this.updateSubscription = interval(30000).subscribe(() => {
      this.actualizarEstadoMantenciones();
    });
    window.addEventListener('focus', () => {
      this.cargarCamionesDesdeBD();
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.actualizarEstadoMantenciones();
    }, 100);
  }

  ionViewWillEnter() {
    this.cargarCamionesDesdeBD();
  }

  ngOnDestroy() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
    window.removeEventListener('focus', () => {
      this.cargarCamionesDesdeBD();
    });
  }

  cargarCamionesDesdeBD() {
    this.camionDataService.obtenerCamiones().subscribe({
      next: (data) => {
        this.camiones = data;
        this.actualizarEstadoMantenciones();
      },
      error: (err) => {
        this.camiones = [];
      }
    });
  }

  actualizarEstadoMantenciones() {
    // Si necesitas recalcular el estado de mantenciones, hazlo aquí sobre this.camiones
  }

  // Al seleccionar un camión, solo abre el modal para actualizar el kilometraje
  seleccionarCamion(camion: any) {
    this.camionSeleccionado = { ...camion };
    this.nuevoKilometraje = camion.kilometraje;
    this.errorMessage = "";
    // No redirigir ni mostrar alertas aquí, solo abrir el modal
  }

  // Al guardar el kilometraje, actualiza en la BD, recalcula mantenciones, muestra alerta y redirige
  guardarKilometraje() {
    if (this.nuevoKilometraje == null || this.nuevoKilometraje < 0) {
      this.errorMessage = 'Por favor ingresa un kilometraje válido.';
      return;
    }
    if (this.nuevoKilometraje < this.camionSeleccionado.kilometraje) {
      this.errorMessage = 'El nuevo kilometraje no puede ser menor al actual.';
      return;
    }
    // Actualiza el camión en la base de datos
    this.camionDataService.actualizarCamion(this.camionSeleccionado.patente, {
      kilometraje: this.nuevoKilometraje
    }).subscribe({
      next: (respuesta) => {
        // El backend ahora retorna { message, data }, donde data incluye mantenciones
        const camionActualizado = ((respuesta && typeof respuesta === 'object' && 'data' in respuesta) ? (respuesta as any).data : respuesta) as any;
        this.camionDataService.setCamionSeleccionado(camionActualizado);

        // Guardar bandera de selección en sessionStorage
        sessionStorage.setItem('vehiculoSeleccionado', 'true');

        // Calcula mantenciones vencidas y muestra alerta si corresponde
        const mantencionesVencidas = (camionActualizado.mantenciones || []).filter((m: any) => {
          const proximoKm = m.proximoKilometraje ?? 0;
          const meses = m.meses ?? 0;
          let fechaVencimiento: Date | null = null;
          if (meses > 0 && camionActualizado.fRevisionTecnica) {
            const fechaBase = new Date(camionActualizado.fRevisionTecnica);
            fechaVencimiento = new Date(fechaBase);
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() + meses);
          }
          const vencida = camionActualizado.kilometraje >= proximoKm || (fechaVencimiento !== null && fechaVencimiento <= new Date());
          return vencida;
        });

        if (mantencionesVencidas.length > 0) {
          const mensajeWhatsApp = `⚠️ Alerta: Mantenciones vencidas en el camión *${camionActualizado.patente}*.
Kilometraje actual: *${camionActualizado.kilometraje}* km

Mantenciones vencidas:
${mantencionesVencidas.map((m: any) => `${m.nombre} (programado para ${m.proximoKilometraje} km)`).join('\n')}`;

          alert(`⚠️ Atención: Estas mantenciones ya vencieron:\n\n${mantencionesVencidas.map((m: any) => `${m.nombre} (programado para ${m.proximoKilometraje} km)`).join('\n')}`);

          // Envía el mensaje de WhatsApp principal
          this.enviarWhatsApp(mensajeWhatsApp);
          this.enviarWhatsapp2(mensajeWhatsApp);
        }

        // Cierra el modal y redirige a la página de mantenciones pendientes
        this.cerrarModal();
        this.router.navigate(['/mantenciones-pendientes']);
      },
      error: (err) => {
        this.errorMessage = 'Error al actualizar el kilometraje.';
      }
    });
  }

  cerrarModal() {
    this.camionSeleccionado = null;
    this.nuevoKilometraje = null;
    this.errorMessage = "";
  }

  enviarWhatsApp(mensaje: string) {
    const telefono = '56948859245';
    const apikey = '4730094';
    const url = `https://api.callmebot.com/whatsapp.php?phone=${telefono}&text=${encodeURIComponent(mensaje)}&apikey=${apikey}`;
    fetch(url)
      .then(response => response.text())
      .then(data => console.log('✅ WhatsApp enviado:', data))
      .catch(error => console.error('❌ Error al enviar WhatsApp:', error));
  }

  enviarWhatsapp2(mensaje: string) {
    const telefono = '56942026558';
    const apikey = '4003809';
    const url = `https://api.callmebot.com/whatsapp.php?phone=${telefono}&text=${encodeURIComponent(mensaje)}&apikey=${apikey}`;
    fetch(url)
      .then(response => response.text())
      .then(data => console.log('📲 WhatsApp 2 enviado:', data))
      .catch(error => console.error('❌ Error al enviar WhatsApp 2:', error));
  }

  getExpiredMaintenanceCount(camion: any): number {
    if (!camion.mantenciones) return 0;
    return camion.mantenciones.filter((m: any) => {
      const proximoKm = Number(m.proximoKilometraje);
      return camion.kilometraje >= proximoKm;
    }).length;
  }
}
