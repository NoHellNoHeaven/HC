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

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'configuraciones', component: ConfiguracionesComponent },
  { path: 'usuarios', component: UsuarioComponent },
  { path: 'camiones', component: CamionesComponent },
  { path: 'contacto', component: FormularioComponent },
  { path: 'choferes', component: ChoferesComponent },
  { path: 'seleccion-vehiculo-chofer', component: SeleccionVehiculoChoferComponent },
  { path: 'reportes', component: ReportesComponent },
  { path: 'alertas', component: AlertasComponent },
  { path: 'mantenciones-pendientes', component: MantencionesPendientesComponent },
  { path: 'historial-mantenciones', component: HistorialMantencionesComponent },
  { path: '**', redirectTo: '/home' }
];
