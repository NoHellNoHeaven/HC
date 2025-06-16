export interface Truck {
  id: string;
  plate_number: string;
  brand: string;
  model: string;
  year: number;
  current_mileage: number;
  fuel_type: 'diesel' | 'gasoline';
  status: 'active' | 'maintenance' | 'inactive';
  
  // Documents and certifications
  circulation_permit_expiry: string;
  technical_inspection_expiry: string;
  insurance_expiry: string;
  
  // Maintenance tracking
  last_maintenance_date?: string;
  last_maintenance_mileage?: number;
  next_maintenance_mileage?: number;
  
  // Assignment
  assigned_driver_id?: string;
  assigned_driver?: User;
  
  created_at: string;
  updated_at?: string;
}

export interface TruckMaintenance {
  id: string;
  truck_id: string;
  truck?: Truck;
  maintenance_type: 'routine' | 'repair' | 'inspection' | 'emergency';
  description: string;
  cost: number;
  mileage_at_maintenance: number;
  performed_date: string;
  performed_by: string;
  next_maintenance_mileage?: number;
  created_at: string;
}