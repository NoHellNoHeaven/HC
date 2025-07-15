import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  rut: string;
  nombre: string;
  rol: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  private _isLoggedIn$ = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this._isLoggedIn$.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string, rememberMe: boolean = false): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', res.token);
        storage.setItem('usuario', JSON.stringify(res.usuario));
        this._isLoggedIn$.next(true);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    this._isLoggedIn$.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  getUsuario(): Usuario | null {
    const data = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    return data ? JSON.parse(data) : null;
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }
}
