import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-driver-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestión de Conductores</h1>
          <p class="mt-2 text-gray-600">Administrar usuarios conductores</p>
        </div>
        <button 
          (click)="showCreateForm = true"
          class="btn btn-primary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Nuevo Conductor
        </button>
      </div>

      <!-- Users List -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Licencia</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let user of users" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <span class="text-primary-600 font-medium">
                        {{ user.full_name.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ user.full_name }}</div>
                      <div class="text-sm text-gray-500">{{ getRoleLabel(user.role) }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ user.email }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ user.phone || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{{ user.license_number || 'N/A' }}</div>
                  <div *ngIf="user.license_expiry" class="text-xs text-gray-400">
                    Vence: {{ formatDate(user.license_expiry) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="status-badge"
                    [ngClass]="{
                      'status-active': user.status === 'active',
                      'status-inactive': user.status === 'inactive'
                    }">
                    {{ getStatusLabel(user.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button 
                    (click)="editUser(user)"
                    class="text-primary-600 hover:text-primary-900">
                    Editar
                  </button>
                  <button 
                    (click)="deleteUser(user)"
                    class="text-danger-600 hover:text-danger-900">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create/Edit Form Modal -->
      <div 
        *ngIf="showCreateForm || editingUser" 
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 leading-6 mb-4">
              {{ editingUser ? 'Editar Usuario' : 'Nuevo Usuario' }}
            </h3>
            
            <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Nombre Completo *</label>
                  <input 
                    type="text" 
                    formControlName="full_name"
                    class="input-field">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Email *</label>
                  <input 
                    type="email" 
                    formControlName="email"
                    class="input-field">
                </div>
                
                <div *ngIf="!editingUser">
                  <label class="block text-sm font-medium text-gray-700">Contraseña *</label>
                  <input 
                    type="password" 
                    formControlName="password"
                    class="input-field">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input 
                    type="tel" 
                    formControlName="phone"
                    class="input-field">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Rol</label>
                  <select formControlName="role" class="input-field">
                    <option value="driver">Conductor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Estado</label>
                  <select formControlName="status" class="input-field">
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Número de Licencia</label>
                  <input 
                    type="text" 
                    formControlName="license_number"
                    class="input-field">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Vencimiento de Licencia</label>
                  <input 
                    type="date" 
                    formControlName="license_expiry"
                    class="input-field">
                </div>
              </div>
              
              <div class="mt-6 flex justify-end space-x-3">
                <button 
                  type="button"
                  (click)="cancelForm()"
                  class="btn btn-secondary">
                  Cancelar
                </button>
                <button 
                  type="submit"
                  [disabled]="userForm.invalid || loading"
                  class="btn btn-primary">
                  {{ loading ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DriverManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  users: User[] = [];
  showCreateForm = false;
  editingUser: User | null = null;
  loading = false;

  userForm: FormGroup;

  constructor() {
    this.userForm = this.fb.group({
      full_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      phone: [''],
      role: ['driver', [Validators.required]],
      status: ['active', [Validators.required]],
      license_number: [''],
      license_expiry: ['']
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  private loadUsers() {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  editUser(user: User) {
    this.editingUser = user;
    this.userForm.patchValue({
      ...user,
      license_expiry: user.license_expiry ? user.license_expiry.split('T')[0] : ''
    });
    
    // Remove password requirement for editing
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }

  deleteUser(user: User) {
    if (confirm(`¿Está seguro de que desea eliminar al usuario ${user.full_name}?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  onSubmit() {
    if (this.userForm.valid && !this.loading) {
      this.loading = true;
      const formData = this.userForm.value;

      if (this.editingUser) {
        // Update existing user
        const { password, ...updateData } = formData;
        this.userService.updateUser(this.editingUser.id, updateData).subscribe({
          next: () => {
            this.loadUsers();
            this.cancelForm();
          },
          error: (error) => {
            console.error('Error updating user:', error);
          },
          complete: () => {
            this.loading = false;
          }
        });
      } else {
        // Create new user
        this.authService.signUp(formData.email, formData.password, formData).subscribe({
          next: () => {
            this.loadUsers();
            this.cancelForm();
          },
          error: (error) => {
            console.error('Error creating user:', error);
          },
          complete: () => {
            this.loading = false;
          }
        });
      }
    }
  }

  cancelForm() {
    this.showCreateForm = false;
    this.editingUser = null;
    this.userForm.reset({
      role: 'driver',
      status: 'active'
    });
    
    // Re-add password requirement for new users
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'admin': 'Administrador',
      'driver': 'Conductor'
    };
    return labels[role] || role;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Activo',
      'inactive': 'Inactivo'
    };
    return labels[status] || status;
  }
}