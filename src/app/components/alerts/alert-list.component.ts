import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { Alert } from '../../models/alert.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-alert-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Alertas</h1>
        <p class="mt-2 text-gray-600">Gestión de alertas y notificaciones</p>
      </div>

      <!-- Filter Tabs -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-8">
          <button 
            (click)="selectedFilter = 'all'"
            [class]="selectedFilter === 'all' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors">
            Todas ({{ alerts.length }})
          </button>
          <button 
            (click)="selectedFilter = 'pending'"
            [class]="selectedFilter === 'pending' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors">
            Pendientes ({{ pendingCount }})
          </button>
          <button 
            (click)="selectedFilter = 'critical'"
            [class]="selectedFilter === 'critical' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors">
            Críticas ({{ criticalCount }})
          </button>
        </nav>
      </div>

      <!-- Alerts List -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <ul class="divide-y divide-gray-200" *ngIf="filteredAlerts.length > 0; else noAlerts">
          <li 
            *ngFor="let alert of filteredAlerts" 
            class="p-6 hover:bg-gray-50 transition-colors">
            <div class="flex items-center justify-between">
              <div class="flex-1">
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
                  <h3 class="text-lg font-medium text-gray-900">{{ alert.title }}</h3>
                  <span 
                    class="status-badge"
                    [ngClass]="{
                      'status-alert': alert.status === 'pending',
                      'status-maintenance': alert.status === 'acknowledged',
                      'status-active': alert.status === 'resolved'
                    }">
                    {{ getStatusLabel(alert.status) }}
                  </span>
                </div>
                
                <p class="mt-2 text-gray-600">{{ alert.description }}</p>
                
                <div class="mt-3 flex items-center space-x-6 text-sm text-gray-500">
                  <span class="flex items-center">
                    <svg class="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4h0a3 3 0 013 3v5a3 3 0 01-3 3H7a3 3 0 01-3-3v-5a3 3 0 013-3z"/>
                    </svg>
                    {{ alert.truck?.plate_number }}
                  </span>
                  
                  <span class="flex items-center">
                    <svg class="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4h0a3 3 0 013 3v5a3 3 0 01-3 3H7a3 3 0 01-3-3v-5a3 3 0 013-3z"/>
                    </svg>
                    Vence: {{ formatDate(alert.due_date) }}
                  </span>
                  
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
              
              <div class="flex items-center space-x-2 ml-4">
                <button 
                  *ngIf="alert.status === 'pending'"
                  (click)="acknowledgeAlert(alert)"
                  class="btn btn-secondary">
                  Reconocer
                </button>
                
                <button 
                  *ngIf="alert.status === 'acknowledged'"
                  (click)="resolveAlert(alert)"
                  class="btn btn-success">
                  Resolver
                </button>
                
                <button 
                  *ngIf="currentUser?.role === 'admin'"
                  (click)="deleteAlert(alert)"
                  class="btn btn-danger">
                  Eliminar
                </button>
              </div>
            </div>
          </li>
        </ul>
        
        <ng-template #noAlerts>
          <div class="p-12 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zm-8-8h5l-5-5v5z"/>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No hay alertas</h3>
            <p class="mt-1 text-sm text-gray-500">No se encontraron alertas que coincidan con el filtro seleccionado.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `
})
export class AlertListComponent implements OnInit {
  private alertService = inject(AlertService);
  private authService = inject(AuthService);

  currentUser: User | null = null;
  alerts: Alert[] = [];
  selectedFilter: 'all' | 'pending' | 'critical' = 'all';

  get filteredAlerts(): Alert[] {
    switch (this.selectedFilter) {
      case 'pending':
        return this.alerts.filter(alert => alert.status === 'pending');
      case 'critical':
        return this.alerts.filter(alert => alert.priority === 'critical');
      default:
        return this.alerts;
    }
  }

  get pendingCount(): number {
    return this.alerts.filter(alert => alert.status === 'pending').length;
  }

  get criticalCount(): number {
    return this.alerts.filter(alert => alert.priority === 'critical').length;
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.loadAlerts();
    });
  }

  private loadAlerts() {
    if (this.currentUser?.role === 'admin') {
      this.alertService.getAlerts().subscribe(alerts => {
        this.alerts = alerts;
      });
    } else if (this.currentUser?.role === 'driver') {
      this.alertService.getDriverAlerts(this.currentUser.id).subscribe(alerts => {
        this.alerts = alerts;
      });
    }
  }

  acknowledgeAlert(alert: Alert) {
    this.alertService.updateAlertStatus(alert.id, 'acknowledged').subscribe({
      next: () => {
        this.loadAlerts();
      },
      error: (error) => {
        console.error('Error acknowledging alert:', error);
      }
    });
  }

  resolveAlert(alert: Alert) {
    this.alertService.updateAlertStatus(alert.id, 'resolved').subscribe({
      next: () => {
        this.loadAlerts();
      },
      error: (error) => {
        console.error('Error resolving alert:', error);
      }
    });
  }

  deleteAlert(alert: Alert) {
    if (confirm('¿Está seguro de que desea eliminar esta alerta?')) {
      this.alertService.deleteAlert(alert.id).subscribe({
        next: () => {
          this.loadAlerts();
        },
        error: (error) => {
          console.error('Error deleting alert:', error);
        }
      });
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

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Pendiente',
      'acknowledged': 'Reconocida',
      'resolved': 'Resuelta'
    };
    return labels[status] || status;
  }
}