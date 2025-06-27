import { Component } from '@angular/core';
import { NavbarComponent } from '../../navbar/navbar.component';
import { CommonModule } from '@angular/common';

interface Alerta {
  tipo: string;
  prioridad: string;
  programada: boolean;
  titulo: string;
  descripcion: string;
  camion: string;
  kilometraje: string;
  costo: string;
  fecha: string;
}

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './alertas.component.html',
  styleUrls: ['./alertas.component.scss']
})
export class AlertasComponent {
  filtro: string = 'Todas';

  alertas: Alerta[] = [
    {
      tipo: 'Crítica',
      prioridad: 'Preventivo',
      programada: true,
      titulo: 'Temperatura del Motor Elevada',
      descripcion: 'El sensor indica temperatura del motor sobre los 90°C. Requiere atención inmediata.',
      camion: 'CAM-001',
      kilometraje: '245.000 km',
      costo: '$1.500',
      fecha: '26-06-2025'
    },
    {
      tipo: 'Preventiva',
      prioridad: 'Mecánico',
      programada: false,
      titulo: 'Cambio de Aceite Vencido',
      descripcion: 'Último cambio hace 12.000 km. Programar cambio urgente.',
      camion: 'CAM-002',
      kilometraje: '187.500 km',
      costo: '$2.500',
      fecha: '26-06-2025'
    },
    {
      tipo: 'Revisión',
      prioridad: 'Frenos',
      programada: false,
      titulo: 'Revisión de frenos',
      descripcion: 'Pastillas de freno con 90% de desgaste. Programar reemplazo.',
      camion: 'CAM-003',
      kilometraje: '154.700 km',
      costo: '$2.800',
      fecha: 'N/A'
    },
    {
      tipo: 'Inspección',
      prioridad: 'Neumáticos',
      programada: false,
      titulo: 'Inspección de Neumáticos',
      descripcion: 'Revisión mensual de presión y desgaste de neumáticos.',
      camion: 'CAM-001',
      kilometraje: '245.000 km',
      costo: 'N/A',
      fecha: 'N/A'
    },
    {
      tipo: 'Correctiva',
      prioridad: 'Filtro',
      programada: false,
      titulo: 'Cambio de Filtro',
      descripcion: 'Filtro de aire y combustible requiere reemplazo según programa.',
      camion: 'CAM-004',
      kilometraje: '182.450 km',
      costo: '$1.800',
      fecha: 'N/A'
    },
    {
      tipo: 'Batería',
      prioridad: 'Eléctrico',
      programada: false,
      titulo: 'Batería con Baja Carga',
      descripcion: 'Voltaje de batería por debajo de 12V. Posible falla inminente.',
      camion: 'CAM-002',
      kilometraje: '187.500 km',
      costo: '$2.500',
      fecha: 'N/A'
    }
  ];

  get totalAlertas(): number {
    return this.alertas.length;
  }

  get criticasCount(): number {
    return this.alertas.filter(a => a.tipo === 'Crítica').length;
  }

  get vencidasCount(): number {
    return this.alertas.filter(a => a.fecha === 'N/A').length;
  }

  get programadasCount(): number {
    return this.alertas.filter(a => a.programada).length;
  }

  alertasFiltradas(): Alerta[] {
    switch (this.filtro) {
      case 'Críticas':
        return this.alertas.filter(a => a.tipo === 'Crítica');
      case 'Inspección':
        return this.alertas.filter(a => a.tipo === 'Inspección');
      case 'Mecánica':
        return this.alertas.filter(a => a.prioridad === 'Mecánico');
      case 'Favoritas':
        return []; // pendiente implementar
      case 'Todas':
      default:
        return this.alertas;
    }
  }

  programar(alerta: Alerta) {
    alerta.programada = true;
    alert(`Alerta "${alerta.titulo}" programada.`);
  }

  marcarCompletada(alerta: Alerta) {
    this.alertas = this.alertas.filter(a => a !== alerta);
    alert(`Alerta "${alerta.titulo}" marcada como completada.`);
  }

  calcularCostoTotal(): string {
    let total = 0;
    for (const a of this.alertas) {
      if (a.costo && a.costo.startsWith('$')) {
        const valorNum = Number(a.costo.replace(/\$/g, '').replace(/\./g, ''));
        if (!isNaN(valorNum)) {
          total += valorNum;
        }
      }
    }
    return `$${total.toLocaleString()}`;
  }
}
