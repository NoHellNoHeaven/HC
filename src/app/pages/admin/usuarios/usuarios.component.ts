import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarOptions } from '@fullcalendar/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { FullCalendarModule } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-usuario',
  standalone: true,
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
  imports: [
    CommonModule,
    FullCalendarModule,
    NavbarComponent
  ]
})
export class UsuarioComponent {
  @ViewChild('calendar') calendarComponent?: FullCalendarComponent;

  nombre = 'Roberto Hernández';
  licencia = 'A-1234567';

  estadoServicio = {
    estado: 'Activo',
    desde: '16:20',
    nota: 'Conducción continua'
  };

  ruta = {
    origen: 'Valparaíso',
    destino: 'Santiago',
    progreso: 75,
    kmRestantes: 38,
    eta: '19:05',
    ciudadActual: 'Curacaví',
    velocidadPromedio: 82
  };

  camion = {
    placa: 'FK-7289',
    combustible: 62,
    kilometraje: 82450,
    capacidad: 12000,
    mantenimiento: {
      tipo: 'Cambio de aceite',
      fecha: '2025-06-22',
      realizado: false
    }
  };

  carga = {
    descripcion: 'Electrodomésticos',
    peso: 3000,
    destino: 'Mall Plaza Oeste',
    estado: 'Pendiente'
  };

  vistaActual: 'calendar' | 'list' = 'calendar';

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    locale: 'es',
    plugins: [dayGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    dateClick: this.handleDateClick.bind(this),
    events: [
      { title: 'Cambio de aceite', date: '2025-06-22' },
      { title: 'Entrega de carga', date: '2025-06-23' }
    ]
  };

  switchView(view: 'calendar' | 'list') {
    this.vistaActual = view;
  }

  esVistaCalendar(): boolean {
    return this.vistaActual === 'calendar';
  }

  esVistaList(): boolean {
    return this.vistaActual === 'list';
  }

  handleDateClick(arg: any) {
    alert('Haz hecho clic en la fecha: ' + arg.dateStr);
  }

  cambiarEstadoServicio() {
    if (this.estadoServicio.estado === 'Activo') {
      this.estadoServicio.estado = 'Pausado';
      this.estadoServicio.nota = 'Esperando asignación';
    } else {
      this.estadoServicio.estado = 'Activo';
      this.estadoServicio.nota = 'Conducción continua';
    }
  }

  marcarMantenimientoRealizado() {
    this.camion.mantenimiento.realizado = true;
  }

  confirmarEntrega() {
    this.carga.estado = 'Confirmada';
  }
}
