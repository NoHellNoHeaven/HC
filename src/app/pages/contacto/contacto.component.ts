import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [FormsModule, NavbarComponent],
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.css']
})
export class FormularioComponent {
  contacto = {
    nombre: '',
    apellido: '',
    email: '',
    celular: '',
    asunto: '',
    mensaje: ''
  };

  enviarFormulario() {
    console.log('Formulario enviado:', this.contacto);
    alert('Gracias por contactarnos 😊');
    this.contacto = {
      nombre: '',
      apellido: '',
      email: '',
      celular: '',
      asunto: '',
      mensaje: ''
    };
  }

  soloNumeros(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
}
