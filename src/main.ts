import { bootstrapApplication } from '@angular/platform-browser';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, provideRouter, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

// Services
import { AuthService } from './app/services/auth.service';
import { User } from './app/models/user.model';

// Components
import { HeaderComponent } from './app/components/layout/header.component';
import { LoginComponent } from './app/components/auth/login.component';
import { DashboardComponent } from './app/components/dashboard/dashboard.component';
import { AlertListComponent } from './app/components/alerts/alert-list.component';
import { AlertCalendarComponent } from './app/components/alerts/alert-calendar.component';
import { TruckManagementComponent } from './app/components/admin/truck-management.component';
import { DriverManagementComponent } from './app/components/admin/driver-management.component';
import { ReportsComponent } from './app/components/reports/reports.component';

// Guards
import { authGuard, adminGuard } from './app/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'alerts', component: AlertListComponent, canActivate: [authGuard] },
  { path: 'alerts/calendar', component: AlertCalendarComponent, canActivate: [authGuard] },
  { path: 'admin/trucks', component: TruckManagementComponent, canActivate: [adminGuard] },
  { path: 'admin/drivers', component: DriverManagementComponent, canActivate: [adminGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '/dashboard' }
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-header *ngIf="currentUser"></app-header>
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class App implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  currentUser: User | null = null;

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      
      // Redirect to login if not authenticated and not already on login page
      if (!user && !this.router.url.includes('/login')) {
        this.router.navigate(['/login']);
      }
    });
  }
}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
});