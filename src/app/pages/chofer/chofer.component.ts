import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  standalone: true,
  selector: 'app-choferes',
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './chofer.component.html',
  styleUrls: ['./chofer.component.scss']
})
export class ChoferesComponent {
  constructor(private router: Router) {}

  choferes = [
    { nombre: 'Juan', apellido: 'Pérez', telefono: '123456789', licencia: 'ABC12345' },
    { nombre: 'María', apellido: 'González', telefono: '987654321', licencia: 'XYZ98765' }
  ];

  // Variables para el modal de agregar chofer
  mostrarFormularioAgregar = false;
  nuevoChofer = {
    nombre: '',
    apellido: '',
    telefono: '',
    licencia: ''
  };

  // Variables para el modal de editar chofer
  mostrarFormularioEdicion = false;
  choferEditado: any = {};

  // Navegar a configuraciones
  navegar() {
    this.router.navigate(['/configuraciones']);
  }

  // Abrir modal agregar chofer
  abrirAgregarChofer() {
    this.mostrarFormularioAgregar = true;
  }

  // Cancelar modal agregar chofer
  cancelarAgregar() {
    this.mostrarFormularioAgregar = false;
    this.nuevoChofer = { nombre: '', apellido: '', telefono: '', licencia: '' };
  }

  // Agregar chofer y cerrar modal
  agregarChofer() {
    if (
      this.nuevoChofer.nombre.trim() &&
      this.nuevoChofer.apellido.trim() &&
      this.nuevoChofer.telefono.trim() &&
      this.nuevoChofer.licencia.trim()
    ) {
      this.choferes.push({ ...this.nuevoChofer });
      this.cancelarAgregar();
    } else {
      alert('Por favor completa todos los campos antes de agregar.');
    }
  }

  // Abrir modal editar chofer
  editarChofer(chofer: any) {
    this.choferEditado = { ...chofer };
    this.mostrarFormularioEdicion = true;
  }

  // Guardar edición y cerrar modal
  guardarEdicion() {
    const index = this.choferes.findIndex(c => c.licencia === this.choferEditado.licencia);
    if (index !== -1) {
      this.choferes[index] = { ...this.choferEditado };
    }
    this.cancelarEdicion();
  }

  // Cancelar edición y cerrar modal
  cancelarEdicion() {
    this.mostrarFormularioEdicion = false;
    this.choferEditado = {};
  }

  // Eliminar chofer con confirmación
  eliminarChofer(chofer: any) {
    if (confirm(`¿Seguro que quieres eliminar a ${chofer.nombre} ${chofer.apellido}?`)) {
      this.choferes = this.choferes.filter(c => c !== chofer);
    }
  }
}
