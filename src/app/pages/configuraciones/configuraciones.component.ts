import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-configuraciones',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './configuraciones.component.html',
  styleUrls: ['./configuraciones.component.css']
})
export class ConfiguracionesComponent implements OnInit {
  theme: 'light' | 'dark' = 'light';
  language: string = 'es';
  privacy: string = 'public';

  constructor(
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.theme = this.themeService.getCurrentTheme() as 'light' | 'dark';
    this.language = localStorage.getItem('language') || 'es';
    this.privacy = localStorage.getItem('privacy') || 'public';
  }

  onThemeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selectedTheme = (select?.value === 'dark' ? 'dark' : 'light') as 'light' | 'dark';
    this.theme = selectedTheme;
    this.themeService.setTheme(selectedTheme);
  }

  guardarConfiguracion(key: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select?.value;
    if (value) {
      localStorage.setItem(key, value);

      if (key === 'language') this.language = value;
      if (key === 'privacy') this.privacy = value;
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.theme = this.themeService.getCurrentTheme() as 'light' | 'dark';
  }

  mostrarMensaje(): void {
    alert('Cambios guardados correctamente.');
  }

  navegar(): void {
    this.router.navigate(['/choferes']);
  }
}
