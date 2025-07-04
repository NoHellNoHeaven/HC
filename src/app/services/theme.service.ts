import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly themeKey = 'theme';

  constructor() {
    this.initTheme(); // Aplica el tema guardado al iniciar
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem(this.themeKey) || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  toggleTheme(): void {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(this.themeKey, newTheme);
  }

  getCurrentTheme(): string {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  setTheme(theme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.themeKey, theme);
  }
}
