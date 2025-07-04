import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FullCalendarModule],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {
  constructor() {
    this.cargarTemaGuardado(); // Aplica el tema al iniciar
  }

  cambiarTema(valor: 'light' | 'dark') {
    const html = document.documentElement;

    html.setAttribute('data-theme', valor);
    localStorage.setItem('theme', valor);
  }

  cargarTemaGuardado() {
    const tema = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    this.cambiarTema(tema);
  }

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin]
  };
}
