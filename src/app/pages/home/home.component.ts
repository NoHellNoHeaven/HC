import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { CamionService } from '../../servicios/camion.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule,
    NavbarComponent 
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('calendar') calendarComponent?: FullCalendarComponent;

  // Datos reales calculados desde localStorage
  stats: any[] = [];
  camiones: any[] = [];
  listaMantenciones: any[] = [];
  alertas: any[] = [];
  historialMantenciones: any[] = [];

  vistaActual: 'calendar' | 'list' = 'calendar';
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    dateClick: this.handleDateClick.bind(this),
    events: [],
    fixedWeekCount: false,
    visibleRange: (currentDate) => {
      const start = new Date(currentDate.valueOf());
      const end = new Date(currentDate.valueOf());
  
      start.setDate(1);
      end.setDate(1);
      end.setMonth(end.getMonth());
      end.setDate(end.getDate() + 34);
  
      return { start, end };
    }
  };

  constructor(
    private router: Router,
    private camionDataService: CamionService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.cargarDatosReales();
    
    // Actualizar datos cuando la ventana vuelve a estar activa
    window.addEventListener('focus', () => {
      this.cargarDatosReales();
    });
  }

  ngOnDestroy() {
    // Remover el event listener
    window.removeEventListener('focus', () => {
      this.cargarDatosReales();
    });
  }

  cargarDatosReales() {
    // Cargar camiones desde localStorage
    const camionesData = JSON.parse(localStorage.getItem('camiones') || '[]');
    
    // Procesar camiones y calcular estadísticas
    this.camiones = camionesData.map((camion: any) => {
      const mantencionesVencidas = this.calcularMantencionesVencidas(camion);
      const proximaMantencion = this.calcularProximaMantencion(camion);
      const progreso = this.calcularProgresoMantencion(camion);
      
      return {
        nombre: `${camion.marca} ${camion.modelo}`,
        estado: mantencionesVencidas.length > 0 ? 'en mantencion' : 'activo',
        patente: camion.patente,
        anio: camion.anno,
        alertas: mantencionesVencidas.length,
        ultimaMantencion: this.obtenerUltimaMantencion(camion),
        proximaMantencion: proximaMantencion,
        progreso: progreso,
        kmActual: camion.kilometraje_camion,
        kmMeta: this.calcularKmMeta(camion),
        mantencionesVencidas: mantencionesVencidas
      };
    });

    // Calcular estadísticas generales
    this.calcularEstadisticas();
    
    // Generar lista de mantenciones
    this.generarListaMantenciones();
    
    // Generar alertas
    this.generarAlertas();
    
    // Cargar historial de mantenciones
    this.cargarHistorialMantenciones();
    
    // Actualizar eventos del calendario
    this.actualizarEventosCalendario();
  }

  calcularEstadisticas() {
    const totalCamiones = this.camiones.length;
    const camionesOperativos = this.camiones.filter(c => c.estado === 'activo').length;
    const alertasCriticas = this.camiones.reduce((total, c) => total + c.alertas, 0);
    const mantencionesPendientes = this.listaMantenciones.filter(m => m.nivel === 'critica').length;

    this.stats = [
      { label: 'Camiones operativos', value: camionesOperativos },
      { label: 'Alertas críticas', value: alertasCriticas },
      { label: 'Mantenimientos pendientes', value: mantencionesPendientes },
      { label: 'Total de camiones', value: totalCamiones }
    ];
  }

  calcularMantencionesVencidas(camion: any): any[] {
    if (!camion.mantenciones) return [];
    
    return camion.mantenciones.filter((m: any) => {
      const proximoKm = Number(m.proximoKilometraje);
      const fechaBase = new Date(camion.fecha_revision_tecnica + '-01');
      const fechaVencimiento = new Date(fechaBase);
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + Number(m.meses));
      
      return camion.kilometraje_camion >= proximoKm || fechaVencimiento <= new Date();
    });
  }

  calcularProximaMantencion(camion: any): string {
    if (!camion.mantenciones || camion.mantenciones.length === 0) return 'No programada';
    
    const mantencionesFuturas = camion.mantenciones.filter((m: any) => {
      const proximoKm = Number(m.proximoKilometraje);
      return camion.kilometraje_camion < proximoKm;
    });
    
    if (mantencionesFuturas.length === 0) return 'Todas vencidas';
    
    const proxima = mantencionesFuturas.reduce((min: any, m: any) => {
      return Number(m.proximoKilometraje) < Number(min.proximoKilometraje) ? m : min;
    });
    
    return `${proxima.nombre} - ${proxima.proximoKilometraje} km`;
  }

  calcularProgresoMantencion(camion: any): number {
    if (!camion.mantenciones || camion.mantenciones.length === 0) return 0;
    
    const mantencionesFuturas = camion.mantenciones.filter((m: any) => {
      const proximoKm = Number(m.proximoKilometraje);
      return camion.kilometraje_camion < proximoKm;
    });
    
    if (mantencionesFuturas.length === 0) return 100;
    
    const proxima = mantencionesFuturas.reduce((min: any, m: any) => {
      return Number(m.proximoKilometraje) < Number(min.proximoKilometraje) ? m : min;
    });
    
    const kmActual = camion.kilometraje_camion;
    const kmMeta = Number(proxima.proximoKilometraje);
    const kmUltima = this.obtenerKmUltimaMantencion(camion);
    
    if (kmMeta <= kmUltima) return 100;
    
    return Math.min(100, Math.round(((kmActual - kmUltima) / (kmMeta - kmUltima)) * 100));
  }

  calcularKmMeta(camion: any): number {
    if (!camion.mantenciones || camion.mantenciones.length === 0) return 0;
    
    const mantencionesFuturas = camion.mantenciones.filter((m: any) => {
      const proximoKm = Number(m.proximoKilometraje);
      return camion.kilometraje_camion < proximoKm;
    });
    
    if (mantencionesFuturas.length === 0) return camion.kilometraje_camion;
    
    const proxima = mantencionesFuturas.reduce((min: any, m: any) => {
      return Number(m.proximoKilometraje) < Number(min.proximoKilometraje) ? m : min;
    });
    
    return Number(proxima.proximoKilometraje);
  }

  obtenerUltimaMantencion(camion: any): string {
    // Por ahora retornamos una fecha estimada basada en la fecha de revisión técnica
    if (camion.fecha_revision_tecnica) {
      const fecha = new Date(camion.fecha_revision_tecnica + '-01');
      return fecha.toLocaleDateString('es-ES');
    }
    return 'No disponible';
  }

  obtenerKmUltimaMantencion(camion: any): number {
    // Estimación basada en el kilometraje actual y la frecuencia de mantenciones
    return Math.max(0, camion.kilometraje_camion - 10000);
  }

  generarListaMantenciones() {
    this.listaMantenciones = [];
    
    this.camiones.forEach(camion => {
      if (camion.mantencionesVencidas && camion.mantencionesVencidas.length > 0) {
        camion.mantencionesVencidas.forEach((mantencion: any) => {
          this.listaMantenciones.push({
            fecha: new Date().toLocaleDateString('es-ES'),
            camion: camion.nombre,
            nombre: mantencion.nombre,
            nivel: 'critica'
          });
        });
      }
    });
  }

  generarAlertas() {
    this.alertas = [];
    
    this.camiones.forEach(camion => {
      if (camion.mantencionesVencidas && camion.mantencionesVencidas.length > 0) {
        camion.mantencionesVencidas.forEach((mantencion: any, index: number) => {
          this.alertas.push({
            id: `a${camion.patente}-${index}`,
            camion: camion.nombre,
            tipo: mantencion.nombre,
            descripcion: `Mantención vencida: ${mantencion.nombre}`,
            fechaLimite: new Date().toLocaleDateString('es-ES'),
            km: `${camion.kmActual} / ${mantencion.proximoKilometraje}`,
            nivel: 'Crítica',
            icono: '⚠️',
            estado: 'Pendiente'
          });
        });
      }
    });
  }

  cargarHistorialMantenciones() {
    this.historialMantenciones = [];
    
    // Obtener datos originales de localStorage
    const camionesData = JSON.parse(localStorage.getItem('camiones') || '[]');
    
    console.log('Datos de camiones en localStorage:', camionesData);
    console.log('Número total de camiones:', camionesData.length);
    
    if (camionesData.length === 0) {
      console.log('No hay camiones en localStorage');
      return;
    }
    
    let totalHistoriales = 0;
    let camionesConHistorial = 0;
    
    // Procesar cada camión
    camionesData.forEach((camion: any, index: number) => {
      console.log(`=== Procesando camión ${index + 1}/${camionesData.length}: ${camion.patente} ===`);
      console.log(`Camión completo:`, camion);
      
      // Verificar si tiene historial
      if (camion.historialMantenciones) {
        console.log(`Historial encontrado en ${camion.patente}:`, camion.historialMantenciones);
        console.log(`Número de mantenciones en historial:`, camion.historialMantenciones.length);
        
        if (camion.historialMantenciones.length > 0) {
          camionesConHistorial++;
          totalHistoriales += camion.historialMantenciones.length;
          console.log(`✅ Procesando ${camion.historialMantenciones.length} mantenciones de ${camion.patente}`);
          
          // Procesar cada mantención del historial
          camion.historialMantenciones.forEach((mantencion: any, mantIndex: number) => {
            console.log(`  Mantención ${mantIndex + 1}:`, mantencion);
            
            // Manejar diferentes formatos de fecha con hora
            let fechaFormateada = 'Fecha no disponible';
            try {
              if (mantencion.fechaRealizada) {
                const fecha = new Date(mantencion.fechaRealizada);
                fechaFormateada = fecha.toLocaleDateString('es-ES') + ' ' + fecha.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                });
              } else if (mantencion.fecha) {
                const fecha = new Date(mantencion.fecha);
                fechaFormateada = fecha.toLocaleDateString('es-ES') + ' ' + fecha.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                });
              }
            } catch (error) {
              console.error('Error al formatear fecha:', error);
              fechaFormateada = 'Fecha inválida';
            }
            
            const itemHistorial = {
              fecha: fechaFormateada,
              camion: `${camion.marca} ${camion.modelo}`,
              patente: camion.patente,
              nombre: mantencion.nombre,
              accion: mantencion.accion || 'Mantenimiento realizado',
              kilometraje: mantencion.kilometrajeRealizado || mantencion.kilometraje || 'N/A'
            };
            
            console.log(`  ✅ Agregando al historial:`, itemHistorial);
            this.historialMantenciones.push(itemHistorial);
          });
        } else {
          console.log(`❌ ${camion.patente} tiene historial pero está vacío`);
        }
      } else {
        console.log(`❌ ${camion.patente} NO tiene historial`);
      }
    });
    
    console.log(`=== RESUMEN ===`);
    console.log(`Camiones procesados: ${camionesData.length}`);
    console.log(`Camiones con historial: ${camionesConHistorial}`);
    console.log(`Total de mantenciones encontradas: ${totalHistoriales}`);
    console.log(`Mantenciones agregadas al array: ${this.historialMantenciones.length}`);
    
    // Ordenar por fecha y hora (más reciente primero) - solo si las fechas son válidas
    this.historialMantenciones.sort((a, b) => {
      try {
        // Extraer solo la parte de fecha para el ordenamiento
        const fechaAStr = a.fecha.split(' ')[0]; // Tomar solo la fecha, no la hora
        const fechaBStr = b.fecha.split(' ')[0];
        
        const fechaA = new Date(fechaAStr);
        const fechaB = new Date(fechaBStr);
        
        if (isNaN(fechaA.getTime()) || isNaN(fechaB.getTime())) {
          return 0; // Mantener orden original si las fechas no son válidas
        }
        
        // Si las fechas son iguales, ordenar por hora (más reciente primero)
        if (fechaA.getTime() === fechaB.getTime()) {
          const horaA = a.fecha.split(' ')[1] || '00:00';
          const horaB = b.fecha.split(' ')[1] || '00:00';
          return horaB.localeCompare(horaA);
        }
        
        return fechaB.getTime() - fechaA.getTime();
      } catch (error) {
        console.error('Error al ordenar fechas:', error);
        return 0;
      }
    });
    
    // Limitar a las últimas 4 mantenciones para la vista previa
    this.historialMantenciones = this.historialMantenciones.slice(0, 4);
    
    console.log('Historial final cargado:', this.historialMantenciones);
    console.log('Número final de mantenciones en historial:', this.historialMantenciones.length);
  }

  actualizarEventosCalendario() {
    const eventos: any[] = [];
    
    this.camiones.forEach(camion => {
      if (camion.mantencionesVencidas && camion.mantencionesVencidas.length > 0) {
        camion.mantencionesVencidas.forEach((mantencion: any) => {
          eventos.push({
            title: `${camion.patente} - ${mantencion.nombre}`,
            date: new Date().toISOString().split('T')[0],
            backgroundColor: '#dc3545'
          });
        });
      }
    });
    
    this.calendarOptions.events = eventos;
  }

  switchView(view: 'calendar' | 'list'): void {
    this.vistaActual = view;
  }

  navegar(url: string): void {
    this.router.navigate([url]);
  }

  verDetallesCamion(camion: any): void {
    // Buscar el camión completo en localStorage para obtener todos los datos
    const camionesData = JSON.parse(localStorage.getItem('camiones') || '[]');
    const camionCompleto = camionesData.find((c: any) => c.patente === camion.patente);
    
    if (camionCompleto) {
      // Usar el servicio para establecer el camión seleccionado
      this.camionDataService.setCamionSeleccionado(camionCompleto);
      
      // Navegar a la página de mantenciones pendientes
      this.router.navigate(['/mantenciones-pendientes']);
    } else {
      alert('Error: No se encontró el camión seleccionado');
    }
  }

  handleDateClick(arg: any): void {
    alert('Haz hecho clic en la fecha: ' + arg.dateStr);
  }

  verDetalles(alerta: any): void {
    alert('Detalles: ' + JSON.stringify(alerta));
  }

  reconocerAlerta(alerta: any): void {
    alerta.estado = 'Reconocida';
    alert('Alerta reconocida');
  }

  verHistorialCompleto(): void {
    this.router.navigate(['/historial-mantenciones']);
  }
}
