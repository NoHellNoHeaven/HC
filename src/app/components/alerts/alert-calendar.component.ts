import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { Alert } from '../../models/alert.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-alert-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Calendario de Alertas</h1>
        <p class="mt-2 text-gray-600">Vista mensual de alertas y vencimientos</p>
      </div>

      <!-- Calendar Header -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div class="flex items-center space-x-4">
            <button 
              (click)="previousMonth()"
              class="p-2 hover:bg-gray-100 rounded-md transition-colors">
              <svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <h2 class="text-xl font-semibold text-gray-900">
              {{ currentMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' }) }}
            </h2>
            <button 
              (click)="nextMonth()"
              class="p-2 hover:bg-gray-100 rounded-md transition-colors">
              <svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          
          <button 
            (click)="goToToday()"
            class="btn btn-primary">
            Hoy
          </button>
        </div>

        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 gap-0 border-b border-gray-200">
          <div 
            *ngFor="let day of weekDays" 
            class="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 border-r border-gray-200 last:border-r-0">
            {{ day }}
          </div>
        </div>

        <div class="grid grid-cols-7 gap-0">
          <div 
            *ngFor="let day of calendarDays; trackBy: trackByDay"
            class="min-h-[120px] border-r border-b border-gray-200 last:border-r-0 p-2"
            [class]="getDayClasses(day)">
            
            <div class="font-medium text-sm mb-2"
                 [class]="day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'">
              {{ day.date.getDate() }}
            </div>
            
            <div class="space-y-1" *ngIf="day.alerts.length > 0">
              <div 
                *ngFor="let alert of day.alerts.slice(0, 3)" 
                class="text-xs p-1 rounded cursor-pointer truncate"
                [class]="getAlertClasses(alert)"
                [title]="alert.title + ' - ' + alert.truck?.plate_number">
                {{ alert.title }}
              </div>
              
              <div 
                *ngIf="day.alerts.length > 3"
                class="text-xs text-gray-500 cursor-pointer hover:text-gray-700"
                (click)="showDayAlerts(day)">
                +{{ day.alerts.length - 3 }} más
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="mt-6 bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Leyenda</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-danger-500 rounded"></div>
            <span class="text-sm text-gray-700">Crítica</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-warning-500 rounded"></div>
            <span class="text-sm text-gray-700">Alta</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-yellow-400 rounded"></div>
            <span class="text-sm text-gray-700">Media</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-gray-400 rounded"></div>
            <span class="text-sm text-gray-700">Baja</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Day Alerts Modal -->
    <div 
      *ngIf="selectedDay" 
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      (click)="closeModal()">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Alertas del {{ selectedDay.date.toLocaleDateString('es-ES') }}
          </h3>
          
          <div class="space-y-3 max-h-96 overflow-y-auto">
            <div 
              *ngFor="let alert of selectedDay.alerts"
              class="p-3 border rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-medium text-gray-900">{{ alert.title }}</h4>
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
              <p class="text-sm text-gray-600">{{ alert.description }}</p>
              <p class="text-xs text-gray-500 mt-1">Camión: {{ alert.truck?.plate_number }}</p>
            </div>
          </div>
          
          <div class="mt-4 flex justify-end">
            <button 
              (click)="closeModal()"
              class="btn btn-secondary">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AlertCalendarComponent implements OnInit {
  private alertService = inject(AlertService);
  private authService = inject(AuthService);

  currentUser: User | null = null;
  alerts: Alert[] = [];
  currentMonth = new Date();
  calendarDays: CalendarDay[] = [];
  selectedDay: CalendarDay | null = null;

  weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.loadAlerts();
    });
    
    this.generateCalendar();
  }

  private loadAlerts() {
    if (this.currentUser?.role === 'admin') {
      this.alertService.getAlerts().subscribe(alerts => {
        this.alerts = alerts;
        this.generateCalendar();
      });
    } else if (this.currentUser?.role === 'driver') {
      this.alertService.getDriverAlerts(this.currentUser.id).subscribe(alerts => {
        this.alerts = alerts;
        this.generateCalendar();
      });
    }
  }

  private generateCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dayAlerts = this.getAlertsForDate(currentDate);
      
      days.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: this.isToday(currentDate),
        alerts: dayAlerts
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    this.calendarDays = days;
  }

  private getAlertsForDate(date: Date): Alert[] {
    return this.alerts.filter(alert => {
      const alertDate = new Date(alert.due_date);
      return alertDate.toDateString() === date.toDateString();
    });
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  previousMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.generateCalendar();
  }

  goToToday() {
    this.currentMonth = new Date();
    this.generateCalendar();
  }

  showDayAlerts(day: CalendarDay) {
    this.selectedDay = day;
  }

  closeModal() {
    this.selectedDay = null;
  }

  getDayClasses(day: CalendarDay): string {
    let classes = '';
    
    if (day.isToday) {
      classes += 'bg-primary-50 ';
    }
    
    if (!day.isCurrentMonth) {
      classes += 'bg-gray-50 ';
    }
    
    return classes;
  }

  getAlertClasses(alert: Alert): string {
    switch (alert.priority) {
      case 'critical':
        return 'bg-danger-100 text-danger-800 hover:bg-danger-200';
      case 'high':
        return 'bg-warning-100 text-warning-800 hover:bg-warning-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
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

  trackByDay(index: number, day: CalendarDay): string {
    return day.date.toISOString();
  }
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  alerts: Alert[];
}