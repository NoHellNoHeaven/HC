import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="ml-3">
              <h1 class="text-xl font-semibold text-gray-900">FleetManager</h1>
            </div>
          </div>

          <nav class="hidden md:flex space-x-8">
            <a routerLink="/dashboard" 
               routerLinkActive="text-primary-600 border-primary-600" 
               class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors">
              Dashboard
            </a>
            
            <a *ngIf="currentUser?.role === 'admin'"
               routerLink="/admin/trucks" 
               routerLinkActive="text-primary-600 border-primary-600" 
               class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors">
              Camiones
            </a>
            
            <a *ngIf="currentUser?.role === 'admin'"
               routerLink="/admin/drivers" 
               routerLinkActive="text-primary-600 border-primary-600" 
               class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors">
              Conductores
            </a>
            
            <a routerLink="/alerts" 
               routerLinkActive="text-primary-600 border-primary-600" 
               class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors">
              Alertas
            </a>
            
            <a *ngIf="currentUser?.role === 'admin'"
               routerLink="/reports" 
               routerLinkActive="text-primary-600 border-primary-600" 
               class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors">
              Reportes
            </a>
          </nav>

          <div class="flex items-center space-x-4" *ngIf="currentUser">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span class="text-primary-600 font-medium text-sm">
                  {{ currentUser.full_name.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div class="hidden md:block">
                <p class="text-sm font-medium text-gray-900">{{ currentUser.full_name }}</p>
                <p class="text-xs text-gray-500">{{ currentUser.role === 'admin' ? 'Administrador' : 'Conductor' }}</p>
              </div>
            </div>
            
            <button 
              (click)="signOut()"
              class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Salir
            </button>
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  currentUser: User | null = null;

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  async signOut() {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }
}