import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Alert } from '../models/alert.model';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  constructor(private supabaseService: SupabaseService) {}

  getAlerts(): Observable<Alert[]> {
    return from(
      this.supabaseService.client
        .from('alerts')
        .select(`
          *,
          truck:trucks(id, plate_number, brand, model),
          assigned_driver:users(id, full_name, email)
        `)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) throw error;
          return data || [];
        })
    );
  }

  getDriverAlerts(driverId: string): Observable<Alert[]> {
    return from(
      this.supabaseService.client
        .from('alerts')
        .select(`
          *,
          truck:trucks(id, plate_number, brand, model)
        `)
        .eq('assigned_driver_id', driverId)
        .order('due_date', { ascending: true })
        .then(({ data, error }) => {
          if (error) throw error;
          return data || [];
        })
    );
  }

  createAlert(alert: Omit<Alert, 'id' | 'created_at'>): Observable<Alert> {
    return from(
      this.supabaseService.client
        .from('alerts')
        .insert(alert)
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data;
        })
    );
  }

  updateAlertStatus(id: string, status: Alert['status'], additionalData?: any): Observable<Alert> {
    const updates: any = { status };
    
    if (status === 'acknowledged') {
      updates.acknowledged_at = new Date().toISOString();
    } else if (status === 'resolved') {
      updates.resolved_at = new Date().toISOString();
    }

    return from(
      this.supabaseService.client
        .from('alerts')
        .update({ ...updates, ...additionalData })
        .eq('id', id)
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data;
        })
    );
  }

  deleteAlert(id: string): Observable<void> {
    return from(
      this.supabaseService.client
        .from('alerts')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) throw error;
        })
    );
  }

  getPendingAlertsCount(): Observable<number> {
    return from(
      this.supabaseService.client
        .from('alerts')
        .select('id', { count: 'exact' })
        .eq('status', 'pending')
        .then(({ count, error }) => {
          if (error) throw error;
          return count || 0;
        })
    );
  }
}