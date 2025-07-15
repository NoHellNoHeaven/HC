import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  rut: string;
  nombre: string;
  p_apellido: string;
  m_apellido?: string;
  email: string;
  password?: string;
  telefono: string;
  rol: string;
  licencia?: string;
  vencLicencia?: string;
  telEmergencia?: number;
  direccion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuario`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getUsuario(rut: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${rut}`, { headers: this.getAuthHeaders() });
  }

  crearUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario, { headers: this.getAuthHeaders() });
  }

  actualizarUsuario(rut: string, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${rut}`, usuario, { headers: this.getAuthHeaders() });
  }

  patchUsuario(rut: string, partialData: Partial<Usuario>): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${rut}`, partialData, { headers: this.getAuthHeaders() });
  }

  eliminarUsuario(rut: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${rut}`, { headers: this.getAuthHeaders() });
  }
}
