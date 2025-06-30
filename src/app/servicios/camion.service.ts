import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CamionService {
  private apiUrl = 'http://localhost:3000/api/camion';

  private camionSource = new BehaviorSubject<any>(this.getCamionSeleccionadoLocal());
  camionSeleccionado$ = this.camionSource.asObservable();

  constructor(private http: HttpClient) {}

  setCamionSeleccionado(camion: any): void {
    this.camionSource.next(camion);
    localStorage.setItem('camionSeleccionado', JSON.stringify(camion));
  }

  getCamionSeleccionadoLocal(): any {
    const data = localStorage.getItem('camionSeleccionado');
    return data ? JSON.parse(data) : null;
  }

  // NUEVO: Guarda todo el array completo de camiones en localStorage
  setCamiones(camiones: any[]): void {
    localStorage.setItem('camiones', JSON.stringify(camiones));
  }

  getCamiones(): any[] {
    return JSON.parse(localStorage.getItem('camiones') || '[]');
  }

  crearCamion(camion: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, camion);
  }

  actualizarCamion(patente: string, camion: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${patente}`, camion);
  }

  eliminarCamion(patente: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${patente}`);
  }
}
