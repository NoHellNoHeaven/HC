import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Define la interfaz del usuario (ajústala según tu modelo)
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
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  // Obtener todos los usuarios
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  // Obtener un usuario por RUT
  getUsuario(rut: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${rut}`);
  }

  // Crear un nuevo usuario
  crearUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  // Actualizar un usuario completo (PUT)
  actualizarUsuario(rut: string, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${rut}`, usuario);
  }

  // Actualizar parcialmente un usuario (PATCH)
  patchUsuario(rut: string, partialData: Partial<Usuario>): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${rut}`, partialData);
  }

  // Eliminar un usuario
  eliminarUsuario(rut: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${rut}`);
  }
}
