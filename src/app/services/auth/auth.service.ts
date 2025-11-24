import { Injectable } from '@angular/core';
import { User } from '@supabase/supabase-js';
import { supabase } from '../../core/supabase.client';

@Injectable({ providedIn: 'root' })
export class AuthService {

  // nếu cần dùng trực tiếp client ở chỗ khác
  get client() {
    return supabase;
  }

  async signInWithOAuth(provider: 'google') {
    return supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + '/home',
      },
    });
  }

  async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    return data?.user ?? null;
  }

  async getSession() {
    return supabase.auth.getSession();
  }

  async signOut() {
    await supabase.auth.signOut();
  }


}
