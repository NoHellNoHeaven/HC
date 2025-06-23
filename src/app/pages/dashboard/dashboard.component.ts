import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component'; 


@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [CommonModule, NavbarComponent]
})

export class DashboardComponent {
  alertas = [
    { codigo: 'CAM-004', descripcion: 'Revisión técnica vencida', detalle: 'Venció hace 5 días' },
    { codigo: 'CAM-001', descripcion: 'Cambio de aceite urgente', detalle: 'Excedido por 5.000 km' },
    { codigo: 'CAM-002', descripcion: 'Revisión frenos', detalle: 'Excedido por 2.000 km' },
    { codigo: 'CAM-003', descripcion: 'Revisión neumáticos', detalle: 'Faltan 20.000 km' },
  ];

  camiones = [
    {
      codigo: 'ABC-123', modelo: 'Volvo FH16', chofer: 'Juan Pérez',
      km: '245.000 km', proximoManto: '250.000 km', estado: 'Urgente',
      alertas: ['Cambio de aceite', 'Revisión frenos']
    },
    {
      codigo: 'DEF-456', modelo: 'Scania R450', chofer: 'María García',
      km: '180.000 km', proximoManto: '200.000 km', estado: 'Advertencia',
      alertas: ['Revisión neumáticos']
    },
    {
      codigo: 'GH-789', modelo: 'Mercedes Actros', chofer: 'Carlos López',
      km: '95.000 km', proximoManto: '100.000 km', estado: 'Bueno',
      alertas: []
    },
    {
      codigo: 'JKL-012', modelo: 'Iveco Stralis', chofer: 'Ana Martín',
      km: '299.000 km', proximoManto: '300.000 km', estado: 'Crítico',
      alertas: ['Revisión técnica vencida', 'Cambio embrague', 'Tren delantero']
    }
  ];
}
