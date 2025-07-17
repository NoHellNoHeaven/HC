import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface HistorialMantencion {
  id: number;
  fechaRealizada: string;
  camionPatente: string;
  camionMarca: string;
  camionModelo: string;
  mantencionNombre: string;
  mantencionAccion: string;
  kilometrajeRealizado: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegistrarMantencionData {
  camionPatente: string;
  mantencionId: number;
  kilometrajeRealizado: number;
  observaciones?: string;
  realizadoPor?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HistorialMantencionesService {
  private apiUrl = `${environment.apiUrl}/historial-mantenciones`;

  constructor(private http: HttpClient) {}

  // Obtener todo el historial
  obtenerHistorialCompleto(): Observable<HistorialMantencion[]> {
    return this.http.get<HistorialMantencion[]>(this.apiUrl);
  }

  // Obtener historial por camión
  obtenerHistorialPorCamion(patente: string): Observable<HistorialMantencion[]> {
    return this.http.get<HistorialMantencion[]>(`${this.apiUrl}/camion/${patente}`);
  }

  // Registrar mantención completada
  registrarMantencionCompletada(datos: RegistrarMantencionData): Observable<HistorialMantencion> {
    return this.http.post<HistorialMantencion>(`${this.apiUrl}/registrar`, datos);
  }

  // Eliminar registro del historial
  eliminarRegistro(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Obtener camiones únicos para filtros
  obtenerCamionesUnicos(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/camiones-unicos`);
  }

  // Obtener tipos de mantención únicos para filtros
  obtenerTiposMantencionUnicos(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/tipos-mantencion-unicos`);
  }

  // Exportar a CSV
  exportarHistorialCSV(filtros?: any): Observable<Blob> {
    let url = `${this.apiUrl}/exportar-csv`;
    if (filtros) {
      const params = new URLSearchParams(filtros);
      url += `?${params.toString()}`;
    }
    return this.http.get(url, { responseType: 'blob' });
  }
} 