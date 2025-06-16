import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { User } from '../models/user.model';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private supabaseService: SupabaseService) {}

  getUsers(): Observable<User[]> {
    return from(
      this.supabaseService.client
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) throw error;
          return data || [];
        })
    );
  }

  getDrivers(): Observable<User[]> {
    return from(
      this.supabaseService.client
        .from('users')
        .select('*')
        .eq('role', 'driver')
        .eq('status', 'active')
        .order('full_name', { ascending: true })
        .then(({ data, error }) => {
          if (error) throw error;
          return data || [];
        })
    );
  }

  getUserById(id: string): Observable<User> {
    return from(
      this.supabaseService.client
        .from('users')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data;
        })
    );
  }

  updateUser(id: string, updates: Partial<User>): Observable<User> {
    return from(
      this.supabaseService.client
        .from('users')
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

  deleteUser(id: string): Observable<void> {
    return from(
      this.supabaseService.client
        .from('users')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) throw error;
        })
    );
  }
}