import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { FullCalendarModule } from '@fullcalendar/angular'; // Importa el módulo de FullCalendar
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule,
    NavbarComponent 
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  @ViewChild('calendar') calendarComponent?: FullCalendarComponent;

  // Datos dummy para mostrar en la plantilla
  stats = [
    { label: 'Camiones operativos', value: 12 },
    { label: 'Alertas críticas', value: 3 },
    { label: 'Mantenimientos pendientes', value: 5 },
  ];

  camiones = [
    {
      id: '1',
      nombre: 'Camión A',
      estado: 'activo',
      patente: 'ABC-123',
      anio: 2018,
      alertas: 2,
      ultimaMantencion: '2025-04-01',
      proximaMantencion: '2025-06-01',
      progreso: 75,
      kmActual: 45000,
      kmMeta: 60000
    },
    // Agrega más camiones si quieres
  ];

  listaMantenciones = [
    { fecha: '2025-04-10', camion: 'Camión A', nombre: 'Cambio de aceite', nivel: 'normal' },
    { fecha: '2025-04-15', camion: 'Camión B', nombre: 'Revisión técnica', nivel: 'critica' },
  ];

  alertas = [
    {
      id: 'a1',
      camion: 'Camión A',
      tipo: 'Cambio de aceite',
      descripcion: 'El aceite debe cambiarse antes de 50,000 km',
      fechaLimite: '2025-06-10',
      km: '48000 / 50000',
      nivel: 'Advertencia',
      icono: '⚠️',
      estado: 'Pendiente'
    }
  ];

  vistaActual: 'calendar' | 'list' = 'calendar';
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    dateClick: this.handleDateClick.bind(this),
    events: [
      { title: 'Cambio de aceite', date: '2025-06-10' },
      { title: 'Revisión técnica', date: '2025-06-15' }
    ],
    fixedWeekCount: false, // para permitir flexibilidad
    visibleRange: (currentDate) => {
      const start = new Date(currentDate.valueOf());
      const end = new Date(currentDate.valueOf());
  
      // Ajustamos para mostrar solo 5 semanas
      start.setDate(1); // primer día del mes
      end.setDate(1);
      end.setMonth(end.getMonth());
      end.setDate(end.getDate() + 34); // 5 semanas = 35 días aprox
  
      return { start, end };
    }
  };
  

  constructor(private router: Router) {}

  switchView(view: 'calendar' | 'list'): void {
    this.vistaActual = view;
  }

  navegar(url: string): void {
    this.router.navigate([url]);
  }

  handleDateClick(arg: any): void {
    alert('Haz hecho clic en la fecha: ' + arg.dateStr);
  }

  verDetalles(alerta: any): void {
    alert('Detalles: ' + JSON.stringify(alerta));
  }

  reconocerAlerta(alerta: any): void {
    alerta.estado = 'Reconocida';
    alert('Alerta reconocida');
  }
}
