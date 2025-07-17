import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../app/services/auth.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.authService.isLoggedIn$.pipe(
      map((isLoggedIn) => {
        if (!isLoggedIn) {
          return this.router.createUrlTree(['/login']);
        }
        const usuario = this.authService.getUsuario();
        // Si es Admin, acceso total
        if (usuario?.rol === 'Admin') {
          return true;
        }
        const allowedRoles = route.data['roles'] as string[] | undefined;
        if (!allowedRoles || allowedRoles.length === 0) {
          return true; // Si no se especifican roles, solo requiere login
        }
        if (usuario && allowedRoles.includes(usuario.rol)) {
          return true;
        }
        // Redirigir según el rol
        if (usuario?.rol === 'Chofer') {
          return this.router.createUrlTree(['/seleccion-vehiculo-chofer']);
        } else {
          return this.router.createUrlTree(['/home']);
        }
      })
    );
  }
}
