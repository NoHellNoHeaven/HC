import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TruckService } from '../../services/truck.service';
import { UserService } from '../../services/user.service';
import { Truck } from '../../models/truck.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-truck-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestión de Camiones</h1>
          <p class="mt-2 text-gray-600">Administrar la flota de camiones</p>
        </div>
        <button 
          (click)="showCreateForm = true"
          class="btn btn-primary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Nuevo Camión
        </button>
      </div>

      <!-- Trucks List -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patente</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kilometraje</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conductor</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let truck of trucks" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ truck.plate_number }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ truck.brand }} {{ truck.model }} ({{ truck.year }})
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ truck.current_mileage.toLocaleString() }} km
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="status-badge"
                    [ngClass]="{
                      'status-active': truck.status === 'active',
                      'status-maintenance': truck.status === 'maintenance',
                      'status-inactive': truck.status === 'inactive'
                    }">
                    {{ getStatusLabel(truck.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ truck.assigned_driver?.full_name || 'Sin asignar' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button 
                    (click)="editTruck(truck)"
                    class="text-primary-600 hover:text-primary-900">
                    Editar
                  </button>
                  <button 
                    (click)="deleteTruck(truck)"
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
        *ngIf="showCreateForm || editingTruck" 
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 leading-6 mb-4">
              {{ editingTruck ? 'Editar Camión' : 'Nuevo Camión' }}
            </h3>
            
            <form [formGroup]="truckForm" (ngSubmit)="onSubmit()">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Patente *</label>
                  <input 
                    type="text" 
                    formControlName="plate_number"
                    class="input-field">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Marca *</label>
                  <input 
                    type="text" 
                    formControlName="brand"
                    class="input-field">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Modelo *</label>
                  <input 
                    type="text" 
                    formControlName="model"
                    class="input-field">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Año *</label>
                  <input 
                    type="number" 
                    formControlName="year"
                    class="input-field">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Kilometraje Actual</label>
                  <input 
                    type="number" 
                    formControlName="current_mileage"
                    class="input-field">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Tipo de Combustible</label>
                  <select formControlName="fuel_type" class="input-field">
                    <option value="diesel">Diésel</option>
                    <option value="gasoline">Gasolina</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Estado</label>
                  <select formControlName="status" class="input-field">
                    <option value="active">Activo</option>
                    <option value="maintenance">Mantenimiento</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Conductor Asignado</label>
                  <select formControlName="assigned_driver_id" class="input-field">
                    <option value="">Sin asignar</option>
                    <option *ngFor="let driver of drivers" [value]="driver.id">
                      {{ driver.full_name }}
                    </option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Venc. Permiso de Circulación</label>
                  <input 
                    type="date" 
                    formControlName="circulation_permit_expiry"
                    class="input-field">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Venc. Revisión Técnica</label>
                  <input 
                    type="date" 
                    formControlName="technical_inspection_expiry"
                    class="input-field">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Venc. Seguro</label>
                  <input 
                    type="date" 
                    formControlName="insurance_expiry"
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
                  [disabled]="truckForm.invalid || loading"
                  class="btn btn-primary">
                  {{ loading ? 'Guardando...' : (editingTruck ? 'Actualizar' : 'Crear') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TruckManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private truckService = inject(TruckService);
  private userService = inject(UserService);

  trucks: Truck[] = [];
  drivers: User[] = [];
  showCreateForm = false;
  editingTruck: Truck | null = null;
  loading = false;

  truckForm: FormGroup;

  constructor() {
    this.truckForm = this.fb.group({
      plate_number: ['', [Validators.required]],
      brand: ['', [Validators.required]],
      model: ['', [Validators.required]],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(1990)]],
      current_mileage: [0, [Validators.required, Validators.min(0)]],
      fuel_type: ['diesel', [Validators.required]],
      status: ['active', [Validators.required]],
      assigned_driver_id: [''],
      circulation_permit_expiry: ['', [Validators.required]],
      technical_inspection_expiry: ['', [Validators.required]],
      insurance_expiry: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadTrucks();
    this.loadDrivers();
  }

  private loadTrucks() {
    this.truckService.getTrucks().subscribe(trucks => {
      this.trucks = trucks;
    });
  }

  private loadDrivers() {
    this.userService.getDrivers().subscribe(drivers => {
      this.drivers = drivers;
    });
  }

  editTruck(truck: Truck) {
    this.editingTruck = truck;
    this.truckForm.patchValue({
      ...truck,
      circulation_permit_expiry: truck.circulation_permit_expiry.split('T')[0],
      technical_inspection_expiry: truck.technical_inspection_expiry.split('T')[0],
      insurance_expiry: truck.insurance_expiry.split('T')[0]
    });
  }

  deleteTruck(truck: Truck) {
    if (confirm(`¿Está seguro de que desea eliminar el camión ${truck.plate_number}?`)) {
      this.truckService.deleteTruck(truck.id).subscribe({
        next: () => {
          this.loadTrucks();
        },
        error: (error) => {
          console.error('Error deleting truck:', error);
        }
      });
    }
  }

  onSubmit() {
    if (this.truckForm.valid && !this.loading) {
      this.loading = true;
      const formData = this.truckForm.value;

      const operation = this.editingTruck
        ? this.truckService.updateTruck(this.editingTruck.id, formData)
        : this.truckService.createTruck(formData);

      operation.subscribe({
        next: () => {
          this.loadTrucks();
          this.cancelForm();
        },
        error: (error) => {
          console.error('Error saving truck:', error);
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  cancelForm() {
    this.showCreateForm = false;
    this.editingTruck = null;
    this.truckForm.reset({
      year: new Date().getFullYear(),
      current_mileage: 0,
      fuel_type: 'diesel',
      status: 'active'
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Activo',
      'maintenance': 'Mantenimiento',
      'inactive': 'Inactivo'
    };
    return labels[status] || status;
  }
}