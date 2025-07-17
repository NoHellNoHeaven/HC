import { Routes } from '@angular/router';
import { AdminComponent } from './pages/admin/admin.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { ConfiguracionesComponent } from './pages/configuraciones/configuraciones.component';
import { UsuarioComponent } from './pages/admin/usuarios/usuarios.component';
import { CamionesComponent } from './pages/admin/camiones/camiones.component';
import { FormularioComponent } from './pages/contacto/contacto.component';
import { ChoferesComponent } from './pages/chofer/chofer.component';
import { SeleccionVehiculoChoferComponent } from './pages/seleccion-vehiculo-chofer/seleccion-vehiculo-chofer.component';
import { ReportesComponent } from './pages/admin/reportes/reportes.component';
import { AlertasComponent } from './pages/chofer/alertas/alertas.component';
import { MantencionesPendientesComponent } from './pages/mantenciones-pendientes/mantenciones-pendientes.component';
import { HomeComponent } from './pages/home/home.component';
import { HistorialMantencionesComponent } from './pages/historial-mantenciones/historial-mantenciones.component';
import { AuthGuard } from './guard/auth.guard';
import { CamionSeleccionadoGuard } from './guard/camion-seleccionado.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard], data: { roles: ['Admin'] } },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard], data: { roles: ['Admin'] } },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['Admin'] } },
  { path: 'login', component: LoginComponent },
  { path: 'configuraciones', component: ConfiguracionesComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'Chofer'] } },
  { path: 'usuarios', component: UsuarioComponent, canActivate: [AuthGuard], data: { roles: ['Admin'] } },
  { path: 'camiones', component: CamionesComponent, canActivate: [AuthGuard], data: { roles: ['Admin'] } },
  { path: 'contacto', component: FormularioComponent, canActivate: [AuthGuard], data: { roles: ['Admin'] } },
  { path: 'choferes', component: ChoferesComponent, canActivate: [AuthGuard], data: { roles: ['Admin'] } },
  { path: 'seleccion-vehiculo-chofer', component: SeleccionVehiculoChoferComponent, canActivate: [AuthGuard], data: { roles: ['Chofer'] } },
  { path: 'reportes', component: ReportesComponent, canActivate: [AuthGuard], data: { roles: ['Admin'] } },
  { path: 'alertas', component: AlertasComponent, canActivate: [AuthGuard], data: { roles: ['Admin'] } },
  { path: 'mantenciones-pendientes', component: MantencionesPendientesComponent, canActivate: [AuthGuard, CamionSeleccionadoGuard], data: { roles: ['Chofer'] } },
  { path: 'historial-mantenciones', component: HistorialMantencionesComponent, canActivate: [AuthGuard], data: { roles: ['Admin'] } },
  { path: '**', redirectTo: '/home' }
];
