import { Component, OnInit, Renderer2, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-configuraciones',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './configuraciones.component.html',
  styleUrls: ['./configuraciones.component.css']
})
export class ConfiguracionesComponent implements OnInit {
  theme = 'light'; // valor por defecto
  private renderer = inject(Renderer2);
  private router = inject(Router);

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('preferredTheme') || 'light';
    this.theme = savedTheme;
    this.applyTheme(savedTheme);
  }

  onThemeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selectedTheme = select?.value || 'light';
    this.theme = selectedTheme;
    localStorage.setItem('preferredTheme', selectedTheme);
    this.applyTheme(selectedTheme);
  }

  guardarConfiguracion(key: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select?.value;
    if (value) {
      localStorage.setItem(key, value);
    }
  }

  applyTheme(theme: string): void {
    const body = document.body;
    this.renderer.removeClass(body, 'theme-light');
    this.renderer.removeClass(body, 'theme-dark');
    this.renderer.addClass(body, `theme-${theme}`);
  }

  mostrarMensaje(): void {
    alert('Cambios guardados correctamente.');
  }

  navegar(): void {
    this.router.navigate(['/choferes']);
  }
}
