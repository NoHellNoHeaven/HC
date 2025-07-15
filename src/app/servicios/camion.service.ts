import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

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
  fVencimientoSeguro: string;
  permisoCirculacion: string;
  estado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CamionService {
  private apiUrl = 'https://htserver-production.up.railway.app/camiones'; // usa tu URL real

  private camionSource = new BehaviorSubject<Camion | null>(this.getCamionSeleccionadoLocal());
  camionSeleccionado$ = this.camionSource.asObservable();

  constructor(private http: HttpClient) {}

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

  setCamionesLocal(camiones: Camion[]): void {
    localStorage.setItem('camiones', JSON.stringify(camiones));
  }

  getCamionesLocal(): Camion[] {
    const data = localStorage.getItem('camiones');
    return data ? JSON.parse(data) : [];
  }

  obtenerCamiones(): Observable<Camion[]> {
    return this.http.get<Camion[]>(this.apiUrl);
  }

  crearCamion(camion: Camion): Observable<Camion> {
    return this.http.post<Camion>(this.apiUrl, camion);
  }

  actualizarCamion(patente: string, camion: Partial<Camion>): Observable<Camion> {
    return this.http.put<Camion>(`${this.apiUrl}/${patente}`, camion);
  }

  eliminarCamion(patente: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${patente}`);
  }
}
