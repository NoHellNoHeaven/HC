import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class CamionSeleccionadoGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const bandera = sessionStorage.getItem('vehiculoSeleccionado');
    if (bandera === 'true') {
      return true;
    }
    return this.router.createUrlTree(['/seleccion-vehiculo-chofer']);
  }
} 