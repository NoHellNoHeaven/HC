import { Routes } from '@angular/router';
import { AdminComponent } from './pages/admin/admin.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { ConfiguracionesComponent } from './pages/configuraciones/configuraciones.component';
import { UsuarioComponent } from './pages/admin/usuarios/usuarios.component';
import { CamionesComponent } from './pages/admin/camiones/camiones.component';

export const routes: Routes = [
  { path: 'admin', component: AdminComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'configuraciones', component: ConfiguracionesComponent },
  { path: 'usuarios', component: UsuarioComponent },
  { path: 'camiones', component: CamionesComponent },
];
