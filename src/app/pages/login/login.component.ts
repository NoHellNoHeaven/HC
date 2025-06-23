import { Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfiguracionesComponent } from '../configuraciones/configuraciones.component';
import { Router } from '@angular/router';
import { NavbarComponent } from "../navbar/navbar.component";

const routes: Routes = [
  { path: 'configuraciones', component: ConfiguracionesComponent }
];

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  constructor(private router: Router) {}

  navegar() {
    this.router.navigate(['/configuraciones']);
  }
}