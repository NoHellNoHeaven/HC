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
import { HistorialMantencionesService, HistorialMantencion } from '../../services/historial-mantenciones.service';
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

  // Datos reales desde la base de datos
  stats: any[] = [];
  camiones: any[] = [];
  listaMantenciones: any[] = [];
  alertas: any[] = [];
  historialMantenciones: HistorialMantencion[] = [];
  mantencionesPendientes: any[] = [];
  isLoading: boolean = false;
  error: string = '';

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
    private historialService: HistorialMantencionesService,
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
    this.isLoading = true;
    this.error = '';

    // Primero cargar el historial para poder calcular el progreso correctamente
    this.historialService.obtenerHistorialCompleto().subscribe({
      next: (historialData) => {
        // Ordenar por fecha (más reciente primero)
        this.historialMantenciones = historialData
          .sort((a, b) => new Date(b.fechaRealizada).getTime() - new Date(a.fechaRealizada).getTime());
        
        console.log('Historial cargado desde BD:', this.historialMantenciones);
        
        // Ahora cargar camiones
        this.cargarCamiones();
      },
      error: (error) => {
        console.error('Error al cargar historial:', error);
        this.historialMantenciones = [];
        // Continuar cargando camiones aunque falle el historial
        this.cargarCamiones();
      }
    });
  }

  private cargarCamiones() {
    // Cargar camiones desde la base de datos
    this.camionDataService.obtenerCamiones().subscribe({
      next: (camionesData) => {
        console.log('=== DATOS DE CAMIONES DESDE BACKEND ===');
        console.log('Camiones recibidos:', camionesData);
        
        // Procesar camiones y calcular estadísticas
        this.camiones = camionesData.map((camion: any) => {
          console.log(`Procesando camión: ${camion.patente}`, camion);
          
          const mantencionesVencidas = this.calcularMantencionesVencidas(camion);
          const proximaMantencion = this.calcularProximaMantencion(camion);
          const progreso = this.calcularProgresoMantencion(camion);
          
          console.log(`  - Mantenciones vencidas: ${mantencionesVencidas.length}`, mantencionesVencidas);
          console.log(`  - Próxima mantención: ${proximaMantencion}`);
          console.log(`  - Progreso: ${progreso}%`);
          
          return {
            nombre: `${camion.marca} ${camion.modelo}`,
            estado: mantencionesVencidas.length > 0 ? 'en mantencion' : 'activo',
            patente: camion.patente,
            anio: camion.anio,
            alertas: mantencionesVencidas.length,
            ultimaMantencion: this.obtenerUltimaMantencion(camion),
            proximaMantencion: proximaMantencion,
            progreso: progreso,
            kmActual: camion.kilometraje,
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
        
        // Actualizar mantenciones pendientes
        this.actualizarMantencionesPendientes();
        
        // Actualizar eventos del calendario
        this.actualizarEventosCalendario();
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar camiones:', error);
        this.error = 'Error al cargar los datos de camiones';
        this.isLoading = false;
      }
    });
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
    if (!camion.mantenciones) {
      console.log(`  No hay mantenciones para ${camion.patente}`);
      return [];
    }
    
    console.log(`  Analizando ${camion.mantenciones.length} mantenciones para ${camion.patente}`);
    
    return camion.mantenciones.filter((m: any) => {
      const proximoKm = Number(m.proximoKilometraje);
      const kmActual = Number(camion.kilometraje);
      
      console.log(`    Mantención: ${m.nombre} - Próximo KM: ${proximoKm}, Actual: ${kmActual}`);
      
      // Verificar si está vencida por kilometraje
      if (kmActual >= proximoKm) {
        console.log(`    ✅ VENCIDA por kilometraje`);
        return true;
      }
      
      // Verificar si está vencida por tiempo (si tiene meses configurados)
      if (m.meses && m.meses > 0 && camion.fRevisionTecnica) {
        const fechaBase = new Date(camion.fRevisionTecnica);
        const fechaVencimiento = new Date(fechaBase);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + Number(m.meses));
        
        const vencidaPorTiempo = fechaVencimiento <= new Date();
        console.log(`    Fecha vencimiento: ${fechaVencimiento.toLocaleDateString()}, Vencida por tiempo: ${vencidaPorTiempo}`);
        
        return vencidaPorTiempo;
      }
      
      console.log(`    ✅ NO vencida`);
      return false;
    });
  }

  calcularProximaMantencion(camion: any): string {
    if (!camion.mantenciones || camion.mantenciones.length === 0) return 'No programada';
    
    const mantencionesFuturas = camion.mantenciones.filter((m: any) => {
      const proximoKm = Number(m.proximoKilometraje);
      return camion.kilometraje < proximoKm;
    });
    
    if (mantencionesFuturas.length === 0) return 'Todas vencidas';
    
    const proxima = mantencionesFuturas.reduce((min: any, m: any) => {
      return Number(m.proximoKilometraje) < Number(min.proximoKilometraje) ? m : min;
    });
    
    return `${proxima.nombre} - ${proxima.proximoKilometraje} km`;
  }

  calcularProgresoMantencion(camion: any): number {
    if (!camion.mantenciones || camion.mantenciones.length === 0) return 0;
    
    // Obtener la próxima mantención más cercana
    const mantencionesFuturas = camion.mantenciones.filter((m: any) => {
      const proximoKm = Number(m.proximoKilometraje);
      return Number(camion.kilometraje) < proximoKm;
    });
    
    if (mantencionesFuturas.length === 0) return 100; // Todas vencidas
    
    const proxima = mantencionesFuturas.reduce((min: any, m: any) => {
      return Number(m.proximoKilometraje) < Number(min.proximoKilometraje) ? m : min;
    });
    
    const kmActual = Number(camion.kilometraje);
    const kmMeta = Number(proxima.proximoKilometraje);
    const kmUltima = this.obtenerKmUltimaMantencion(camion);
    
    // Si ya pasamos la meta, mostrar 100%
    if (kmActual >= kmMeta) return 100;
    
    // Calcular progreso basado en el kilometraje desde la última mantención
    const progreso = Math.min(100, Math.round(((kmActual - kmUltima) / (kmMeta - kmUltima)) * 100));
    
    return Math.max(0, progreso); // No mostrar progreso negativo
  }

  calcularKmMeta(camion: any): number {
    if (!camion.mantenciones || camion.mantenciones.length === 0) return 0;
    
    const mantencionesFuturas = camion.mantenciones.filter((m: any) => {
      const proximoKm = Number(m.proximoKilometraje);
      return camion.kilometraje < proximoKm;
    });
    
    if (mantencionesFuturas.length === 0) return camion.kilometraje;
    
    const proxima = mantencionesFuturas.reduce((min: any, m: any) => {
      return Number(m.proximoKilometraje) < Number(min.proximoKilometraje) ? m : min;
    });
    
    return Number(proxima.proximoKilometraje);
  }

  obtenerUltimaMantencion(camion: any): string {
    // Por ahora retornamos una fecha estimada basada en la fecha de revisión técnica
    if (camion.fRevisionTecnica) {
      const fecha = new Date(camion.fRevisionTecnica);
      return fecha.toLocaleDateString('es-ES');
    }
    return 'No disponible';
  }

  obtenerKmUltimaMantencion(camion: any): number {
    // Buscar en el historial la última mantención realizada para este camión
    if (this.historialMantenciones.length > 0) {
      const historialCamion = this.historialMantenciones
        .filter(h => h.camionPatente === camion.patente)
        .sort((a, b) => new Date(b.fechaRealizada).getTime() - new Date(a.fechaRealizada).getTime());
      
      if (historialCamion.length > 0) {
        return Number(historialCamion[0].kilometrajeRealizado);
      }
    }
    
    // Si no hay historial, estimar basado en el kilometraje actual
    // Asumimos que la última mantención fue hace aproximadamente 10,000 km
    return Math.max(0, Number(camion.kilometraje) - 10000);
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
    
    console.log('=== GENERANDO ALERTAS ===');
    
    this.camiones.forEach(camion => {
      console.log(`Generando alertas para ${camion.patente}: ${camion.mantencionesVencidas?.length || 0} mantenciones vencidas`);
      
      if (camion.mantencionesVencidas && camion.mantencionesVencidas.length > 0) {
        camion.mantencionesVencidas.forEach((mantencion: any, index: number) => {
          console.log(`  Agregando alerta: ${mantencion.nombre}`);
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
    
    console.log('Total de alertas generadas:', this.alertas.length);
  }

  cargarHistorialMantenciones() {
    // Cargar historial desde la base de datos
    this.historialService.obtenerHistorialCompleto().subscribe({
      next: (historialData) => {
        // Ordenar por fecha (más reciente primero)
        this.historialMantenciones = historialData
          .sort((a, b) => new Date(b.fechaRealizada).getTime() - new Date(a.fechaRealizada).getTime())
          .slice(0, 4); // Limitar a las últimas 4 mantenciones para la vista previa
        
        console.log('Historial cargado desde BD:', this.historialMantenciones);
      },
      error: (error) => {
        console.error('Error al cargar historial:', error);
        this.historialMantenciones = [];
      }
    });
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
    // Obtener el camión completo desde la base de datos
    this.camionDataService.obtenerCamion(camion.patente).subscribe({
      next: (camionCompleto) => {
        // Usar el servicio para establecer el camión seleccionado
        this.camionDataService.setCamionSeleccionado(camionCompleto);
        
        // Navegar a la página de mantenciones pendientes
        this.router.navigate(['/mantenciones-pendientes']);
      },
      error: (error) => {
        console.error('Error al obtener camión:', error);
        alert('Error: No se pudo cargar el camión seleccionado');
      }
    });
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

  // Método para formatear fecha en el template
  formatearFecha(fecha: string): string {
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  // Método para actualizar las mantenciones pendientes
  actualizarMantencionesPendientes() {
    this.mantencionesPendientes = [];
    
    console.log('=== ACTUALIZANDO MANTENCIONES PENDIENTES ===');
    console.log('Total de camiones:', this.camiones.length);
    console.log('Total de alertas:', this.alertas.length);
    
    this.camiones.forEach((camion, index) => {
      console.log(`Camión ${index + 1}: ${camion.patente}`);
      console.log(`  - Mantenciones vencidas: ${camion.mantencionesVencidas?.length || 0}`);
      console.log(`  - Alertas: ${camion.alertas}`);
      
      if (camion.mantencionesVencidas && camion.mantencionesVencidas.length > 0) {
        camion.mantencionesVencidas.forEach((mantencion: any) => {
          console.log(`    Agregando mantención pendiente: ${mantencion.nombre}`);
          this.mantencionesPendientes.push({
            camion: camion.nombre,
            patente: camion.patente,
            mantencion: mantencion.nombre,
            proximoKm: mantencion.proximoKilometraje,
            kmActual: camion.kmActual
          });
        });
      }
    });
    
    console.log('Total de mantenciones pendientes encontradas:', this.mantencionesPendientes.length);
    console.log('Mantenciones pendientes:', this.mantencionesPendientes);
  }

  // Método para obtener todas las mantenciones pendientes (para compatibilidad)
  obtenerMantencionesPendientes(): any[] {
    return this.mantencionesPendientes;
  }

  irAMantencionesPendientes(item: any) {
    // Guardar el camión seleccionado en el servicio y redirigir
    this.camionDataService.obtenerCamion(item.patente).subscribe({
      next: (camion) => {
        this.camionDataService.setCamionSeleccionado(camion);
        this.router.navigate(['/mantenciones-pendientes']);
      },
      error: (error) => {
        alert('No se pudo cargar el camión para mostrar sus mantenciones.');
      }
    });
  }
}
