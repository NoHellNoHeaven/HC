import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

// Modelo base del camión
export interface Camion {
  patente: string;
  tipoCamion: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  capacidad?: number;
  nroMotor: string;
  nroChasis: string;
  fabrica: string;
  procedencia: string;
  tipoSello: string;
  combustible: string;
  kilometraje: number;
  fRevisionTecnica: string;
  fVencimientoSeguro?: string;
  permisoCirculacion?: string;
  estado?: string;
  mantenciones?: Mantencion[]; // <-- Agregado para evitar error TS2339
}

// Modelo para mantenciones
export interface Mantencion {
  nombre: string;
  accion: string;
  kilometraje: number;
  meses: number;
  proximoKilometraje: number;
}

// Modelo completo para crear camión con mantenciones
export interface CamionConMantenciones extends Camion {
  mantenciones: Mantencion[];
}

@Injectable({
  providedIn: 'root'
})
export class CamionService {
  private apiUrl = 'https://htserver-production.up.railway.app/camiones'; // tu backend en Railway

  // Se mantiene el BehaviorSubject solo para el camión seleccionado
  private camionSource = new BehaviorSubject<Camion | null>(this.getCamionSeleccionadoLocal());
  camionSeleccionado$ = this.camionSource.asObservable();

  constructor(private http: HttpClient) {}

  // ===========================
  // MÉTODOS PARA CAMIÓN SELECCIONADO (puedes seguir usando localStorage solo para la selección)
  // ===========================
  setCamionSeleccionado(camion: Camion | null): void {
    this.camionSource.next(camion);
    if (camion) {
      localStorage.setItem('camionSeleccionado', JSON.stringify(camion));
    } else {
      localStorage.removeItem('camionSeleccionado');
    }
  }

  getCamionSeleccionadoLocal(): Camion | null {
    const data = localStorage.getItem('camionSeleccionado');
    return data ? JSON.parse(data) : null;
  }

  // ===========================
  // MÉTODOS QUE USAN LA BASE DE DATOS REAL (Railway)
  // ===========================

  // Obtener todos los camiones desde la base de datos real
  obtenerCamiones(): Observable<Camion[]> {
    return this.http.get<Camion[]>(this.apiUrl);
  }

  // Obtener un camión específico por patente desde la base de datos real
  obtenerCamion(patente: string): Observable<CamionConMantenciones> {
    return this.http.get<CamionConMantenciones>(`${this.apiUrl}/${patente}`);
  }

  // Crear un camión en la base de datos real
  crearCamion(camion: CamionConMantenciones): Observable<any> {
    return this.http.post<any>(this.apiUrl, camion);
  }

  // Actualizar un camión en la base de datos real
  actualizarCamion(patente: string, camion: Partial<Camion>): Observable<Camion> {
    return this.http.put<Camion>(`${this.apiUrl}/${patente}`, camion);
  }

  // Eliminar un camión en la base de datos real
  eliminarCamion(patente: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${patente}`);
  }

  // Completar una mantención (reprogramar)
  completarMantencion(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/mantenciones/${id}/completar`, {});
  }

  // ===========================
  // MÉTODOS ELIMINADOS:
  // - setCamionesLocal(camiones: Camion[])
  // - getCamionesLocal()
  // Estos métodos han sido eliminados porque ahora todo se gestiona con la base de datos real.
  // ===========================
}
