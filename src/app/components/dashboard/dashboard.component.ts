import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TruckService } from '../../services/truck.service';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { Truck } from '../../models/truck.model';
import { Alert } from '../../models/alert.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p class="mt-2 text-gray-600">Bienvenido al sistema de gestión de flota</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4h0a3 3 0 013 3v5a3 3 0 01-3 3H7a3 3 0 01-3-3v-5a3 3 0 013-3z"/>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Camiones</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ totalTrucks }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Camiones Activos</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ activeTrucks }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">En Mantenimiento</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ maintenanceTrucks }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zm-8-8h5l-5-5v5z"/>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Alertas Pendientes</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ pendingAlerts }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Recent Alerts -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Alertas Recientes</h3>
              <a routerLink="/alerts" class="text-sm text-primary-600 hover:text-primary-500">Ver todas</a>
            </div>
            
            <div class="space-y-3" *ngIf="recentAlerts.length > 0; else noAlerts">
              <div 
                *ngFor="let alert of recentAlerts" 
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ alert.title }}</p>
                  <p class="text-xs text-gray-500">{{ alert.truck?.plate_number }}</p>
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
            
            <ng-template #noAlerts>
              <p class="text-gray-500 text-center py-4">No hay alertas recientes</p>
            </ng-template>
          </div>
        </div>

        <!-- Fleet Status -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Estado de la Flota</h3>
              <a *ngIf="currentUser?.role === 'admin'" routerLink="/admin/trucks" class="text-sm text-primary-600 hover:text-primary-500">Gestionar</a>
            </div>
            
            <div class="space-y-3" *ngIf="recentTrucks.length > 0; else noTrucks">
              <div 
                *ngFor="let truck of recentTrucks" 
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ truck.plate_number }}</p>
                  <p class="text-xs text-gray-500">{{ truck.brand }} {{ truck.model }} - {{ truck.current_mileage.toLocaleString() }} km</p>
                </div>
                <span 
                  class="status-badge"
                  [ngClass]="{
                    'status-active': truck.status === 'active',
                    'status-maintenance': truck.status === 'maintenance',
                    'status-inactive': truck.status === 'inactive'
                  }">
                  {{ getStatusLabel(truck.status) }}
                </span>
              </div>
            </div>
            
            <ng-template #noTrucks>
              <p class="text-gray-500 text-center py-4">No hay camiones registrados</p>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private truckService = inject(TruckService);
  private alertService = inject(AlertService);
  private authService = inject(AuthService);

  currentUser: User | null = null;
  trucks: Truck[] = [];
  alerts: Alert[] = [];
  
  totalTrucks = 0;
  activeTrucks = 0;
  maintenanceTrucks = 0;
  pendingAlerts = 0;
  
  recentAlerts: Alert[] = [];
  recentTrucks: Truck[] = [];

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.loadDashboardData();
  }

  private loadDashboardData() {
    // Load trucks
    this.truckService.getTrucks().subscribe(trucks => {
      this.trucks = trucks;
      this.totalTrucks = trucks.length;
      this.activeTrucks = trucks.filter(t => t.status === 'active').length;
      this.maintenanceTrucks = trucks.filter(t => t.status === 'maintenance').length;
      this.recentTrucks = trucks.slice(0, 5);
    });

    // Load alerts
    if (this.currentUser?.role === 'admin') {
      this.alertService.getAlerts().subscribe(alerts => {
        this.alerts = alerts;
        this.pendingAlerts = alerts.filter(a => a.status === 'pending').length;
        this.recentAlerts = alerts.filter(a => a.status === 'pending').slice(0, 5);
      });
    } else if (this.currentUser?.role === 'driver') {
      this.alertService.getDriverAlerts(this.currentUser.id).subscribe(alerts => {
        this.alerts = alerts;
        this.pendingAlerts = alerts.filter(a => a.status === 'pending').length;
        this.recentAlerts = alerts.filter(a => a.status === 'pending').slice(0, 5);
      });
    }
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

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Activo',
      'maintenance': 'Mantenimiento',
      'inactive': 'Inactivo'
    };
    return labels[status] || status;
  }
}