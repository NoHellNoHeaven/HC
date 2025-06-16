import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TruckService } from '../../services/truck.service';
import { AlertService } from '../../services/alert.service';
import { UserService } from '../../services/user.service';
import { ReportService } from '../../services/report.service';
import { Truck } from '../../models/truck.model';
import { Alert } from '../../models/alert.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Reportes</h1>
        <p class="mt-2 text-gray-600">Generar reportes de la flota en PDF y DOCX</p>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-primary-100 rounded-lg">
              <svg class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Camiones</p>
              <p class="text-2xl font-bold text-gray-900">{{ trucks.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-warning-100 rounded-lg">
              <svg class="h-6 w-6 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Alertas Activas</p>
              <p class="text-2xl font-bold text-gray-900">{{ alerts.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-success-100 rounded-lg">
              <svg class="h-6 w-6 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Conductores</p>
              <p class="text-2xl font-bold text-gray-900">{{ drivers.length }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Report Generation -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Fleet Reports -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Reportes de Flota</h3>
            <p class="mt-1 text-sm text-gray-500">Generar reportes completos de la flota de camiones</p>
          </div>
          <div class="p-6 space-y-4">
            <button 
              (click)="generateFleetReportPDF()"
              [disabled]="loading"
              class="w-full btn btn-primary">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              {{ loading ? 'Generando...' : 'Reporte de Flota (PDF)' }}
            </button>
            
            <button 
              (click)="generateFleetReportDOCX()"
              [disabled]="loading"
              class="w-full btn btn-secondary">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              {{ loading ? 'Generando...' : 'Reporte de Flota (TXT)' }}
            </button>
          </div>
        </div>

        <!-- Driver Reports -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Reportes de Conductores</h3>
            <p class="mt-1 text-sm text-gray-500">Información detallada de conductores y asignaciones</p>
          </div>
          <div class="p-6 space-y-4">
            <button 
              (click)="generateDriverReportPDF()"
              [disabled]="loading"
              class="w-full btn btn-primary">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              {{ loading ? 'Generando...' : 'Reporte de Conductores (PDF)' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="mt-8 bg-white rounded-lg shadow">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Actividad Reciente</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4" *ngIf="alerts.length > 0; else noActivity">
            <div 
              *ngFor="let alert of alerts.slice(0, 5)" 
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-3">
                <div 
                  class="w-3 h-3 rounded-full"
                  [ngClass]="{
                    'bg-danger-500': alert.priority === 'critical',
                    'bg-warning-500': alert.priority === 'high',
                    'bg-yellow-400': alert.priority === 'medium',
                    'bg-gray-400': alert.priority === 'low'
                  }">
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ alert.title }}</p>
                  <p class="text-xs text-gray-500">{{ alert.truck?.plate_number }} - {{ formatDate(alert.created_at) }}</p>
                </div>
              </div>
              <span 
                class="status-badge"
                [ngClass]="{
                  'status-alert': alert.priority === 'critical',
                  'status-maintenance': alert.priority === 'high',
                  'bg-yellow-100 text-yellow-800': alert.priority === 'medium',
                  'bg-gray-100 text-gray-800': alert.priority === 'low'
                }">
                {{ getPriorityLabel(alert.priority) }}
              </span>
            </div>
          </div>
          
          <ng-template #noActivity>
            <p class="text-gray-500 text-center py-8">No hay actividad reciente</p>
          </ng-template>
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  private truckService = inject(TruckService);
  private alertService = inject(AlertService);
  private userService = inject(UserService);
  private reportService = inject(ReportService);

  trucks: Truck[] = [];
  alerts: Alert[] = [];
  drivers: User[] = [];
  loading = false;

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.truckService.getTrucks().subscribe(trucks => {
      this.trucks = trucks;
    });

    this.alertService.getAlerts().subscribe(alerts => {
      this.alerts = alerts;
    });

    this.userService.getDrivers().subscribe(drivers => {
      this.drivers = drivers;
    });
  }

  generateFleetReportPDF() {
    this.loading = true;
    try {
      this.reportService.generateFleetReportPDF(this.trucks, this.alerts);
    } finally {
      this.loading = false;
    }
  }

  generateFleetReportDOCX() {
    this.loading = true;
    try {
      this.reportService.generateFleetReportDOCX(this.trucks, this.alerts);
    } finally {
      this.loading = false;
    }
  }

  generateDriverReportPDF() {
    this.loading = true;
    try {
      this.reportService.generateDriverReportPDF(this.drivers, this.trucks);
    } finally {
      this.loading = false;
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta',
      'critical': 'Crítica'
    };
    return labels[priority] || priority;
  }
}