import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { UsuarioService, Usuario } from '../../services/usuario.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-choferes',
  imports: [CommonModule, FormsModule, NavbarComponent, HttpClientModule],
  templateUrl: './chofer.component.html',
  styleUrls: ['./chofer.component.css']
})
export class ChoferesComponent implements OnInit {
  choferes: Usuario[] = [];

  mostrarFormularioAgregar = false;
  mostrarFormularioEdicion = false;

  nuevoChofer = {
  rut: '',
  nombre: '',
  p_apellido: '',
  m_apellido: '',
  email: '',
  password: '',
  telefono: '',
  rol: 'Chofer',
  licencia: '',
  vencLicencia: '',
  telEmergencia: undefined,
  direccion: '',
  estado: 'Activo', // <-- importante, corregido
};

  choferEditado: Partial<Usuario> = {};

  constructor(private router: Router, private usuarioService: UsuarioService) {}

  ngOnInit() {
    this.cargarChoferes();
  }

  cargarChoferes() {
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        this.choferes = data;
      },
      error: (err) => {
        console.error('Error al cargar choferes', err);
      }
    });
  }

  navegar() {
    this.router.navigate(['/configuraciones']);
  }

  abrirAgregarChofer() {
    this.mostrarFormularioAgregar = true;
    this.nuevoChofer = {
      rut: '',
      nombre: '',
      p_apellido: '',
      m_apellido: '',
      email: '',
      password: '',
      telefono: '',
      rol: 'Chofer',
      licencia: '',
      vencLicencia: '',
      telEmergencia: undefined,
      direccion: '',
      estado: 'Activo' // <-- importante, corregido
    };
  }

  cancelarAgregar() {
    this.mostrarFormularioAgregar = false;
  }

  agregarChofer() {
    if (
      this.nuevoChofer.rut?.trim() &&
      this.nuevoChofer.nombre?.trim() &&
      this.nuevoChofer.p_apellido?.trim() &&
      this.nuevoChofer.telefono?.trim() &&
      this.nuevoChofer.licencia?.trim() &&
      this.nuevoChofer.email?.trim() &&
      this.nuevoChofer.password?.trim()
    ) {
      this.usuarioService.crearUsuario(this.nuevoChofer as Usuario).subscribe({
        next: () => {
          this.cancelarAgregar();
          this.cargarChoferes();
        },
        error: (err) => {
          console.error('Error al crear chofer', err);
          alert('Error al crear chofer');
        }
      });
    } else {
      alert('Por favor completa todos los campos obligatorios');
    }
  }

  editarChofer(chofer: Usuario) {
    this.choferEditado = { ...chofer };
    this.mostrarFormularioEdicion = true;
  }

  cancelarEdicion() {
    this.mostrarFormularioEdicion = false;
  }

  guardarEdicion() {
    if (!this.choferEditado.rut) {
      alert('No se puede editar sin RUT');
      return;
    }

    this.usuarioService.actualizarUsuario(this.choferEditado.rut, this.choferEditado as Usuario).subscribe({
      next: () => {
        this.cancelarEdicion();
        this.cargarChoferes();
      },
      error: (err) => {
        console.error('Error al actualizar chofer', err);
        alert('Error al actualizar chofer');
      }
    });
  }

  eliminarChofer(chofer: Usuario) {
    if (!chofer.rut) {
      alert('No se puede eliminar sin RUT');
      return;
    }
    if (confirm(`¿Seguro que quieres eliminar a ${chofer.nombre} ${chofer.p_apellido}?`)) {
      this.usuarioService.eliminarUsuario(chofer.rut).subscribe({
        next: () => {
          this.cargarChoferes();
        },
        error: (err) => {
          console.error('Error al eliminar chofer', err);
          alert('Error al eliminar chofer');
        }
      });
    }
  }
}
