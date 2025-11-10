import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://ddumqkjqiuheppgdvhiy.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdW1xa2pxaXVoZXBwZ2R2aGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMzQ0MjcsImV4cCI6MjA3NTcxMDQyN30.kU7Uz5tdb7M91WDtkwm3-Qgdc4QlHV3YirxqnnL6NFk'
    );
  }

  async signInWithOAuth(provider: 'google') {
    return this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + '/home',
      },
    });
  }

  async getCurrentUser(): Promise<User | null> {
    const { data } = await this.supabase.auth.getUser();
    return data?.user ?? null;
  }

  async signOut() {
    await this.supabase.auth.signOut();
  }


}
