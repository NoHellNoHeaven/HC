import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {
    this.initAuthListener();
  }

  private initAuthListener() {
    this.supabaseService.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await this.loadUserProfile(session.user.id);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  private async loadUserProfile(userId: string) {
    const { data, error } = await this.supabaseService.client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (data && !error) {
      this.currentUserSubject.next(data);
    }
  }

  async signIn(email: string, password: string) {
    const result = await this.supabaseService.signIn(email, password);
    return result;
  }

  async signUp(email: string, password: string, userData: Partial<User>) {
    const result = await this.supabaseService.signUp(email, password);
    
    if (result.data.user && !result.error) {
      await this.createUserProfile(result.data.user.id, userData);
    }
    
    return result;
  }

  private async createUserProfile(userId: string, userData: Partial<User>) {
    const { data, error } = await this.supabaseService.client
      .from('users')
      .insert({
        id: userId,
        ...userData,
        created_at: new Date().toISOString()
      });

    return { data, error };
  }

  async signOut() {
    return await this.supabaseService.signOut();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }
}