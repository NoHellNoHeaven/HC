// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { NavbarComponent } from '../app/pages/navbar/navbar.component';


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

  cambiarTema(valor: string) {
    const body = document.body;

    body.classList.remove('theme-light', 'theme-dark');

    if (valor === 'light') {
      body.classList.add('theme-light');
      localStorage.setItem('preferredTheme', 'light');
    } else {
      body.classList.add('theme-dark');
      localStorage.setItem('preferredTheme', 'dark');
    }
  }

  cargarTemaGuardado() {
    const tema = localStorage.getItem('preferredTheme') || 'light';
    this.cambiarTema(tema);
  }

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin]
  };
}
