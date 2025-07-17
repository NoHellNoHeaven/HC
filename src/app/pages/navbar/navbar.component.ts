import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService, Usuario } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgIf], 
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  menuOpen = false;
  usuario: Usuario | null = null;
  isLoggedIn = false;

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private authService: AuthService
  ) {
    this.authService.isLoggedIn$.subscribe((logged) => {
      this.isLoggedIn = logged;
      this.usuario = this.authService.getUsuario();
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  navegar(url: string): void {
    this.router.navigate([url]);
  }

  login() {
    this.router.navigate(['/login']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
