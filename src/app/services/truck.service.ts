import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Truck, TruckMaintenance } from '../models/truck.model';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TruckService {
  constructor(private supabaseService: SupabaseService) {}

  getTrucks(): Observable<Truck[]> {
    return from(
      this.supabaseService.client
        .from('trucks')
        .select(`
          *,
          assigned_driver:users(id, full_name, email)
        `)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) throw error;
          return data || [];
        })
    );
  }

  getTruckById(id: string): Observable<Truck> {
    return from(
      this.supabaseService.client
        .from('trucks')
        .select(`
          *,
          assigned_driver:users(id, full_name, email)
        `)
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data;
        })
    );
  }

  createTruck(truck: Omit<Truck, 'id' | 'created_at' | 'updated_at'>): Observable<Truck> {
    return from(
      this.supabaseService.client
        .from('trucks')
        .insert(truck)
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data;
        })
    );
  }

  updateTruck(id: string, updates: Partial<Truck>): Observable<Truck> {
    return from(
      this.supabaseService.client
        .from('trucks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data;
        })
    );
  }

  deleteTruck(id: string): Observable<void> {
    return from(
      this.supabaseService.client
        .from('trucks')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) throw error;
        })
    );
  }

  getTruckMaintenanceHistory(truckId: string): Observable<TruckMaintenance[]> {
    return from(
      this.supabaseService.client
        .from('truck_maintenance')
        .select('*')
        .eq('truck_id', truckId)
        .order('performed_date', { ascending: false })
        .then(({ data, error }) => {
          if (error) throw error;
          return data || [];
        })
    );
  }

  addMaintenanceRecord(maintenance: Omit<TruckMaintenance, 'id' | 'created_at'>): Observable<TruckMaintenance> {
    return from(
      this.supabaseService.client
        .from('truck_maintenance')
        .insert(maintenance)
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data;
        })
    );
  }
}