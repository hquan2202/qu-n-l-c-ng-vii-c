import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient('https://ddumqkjqiuheppgdvhiy.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdW1xa2pxaXVoZXBwZ2R2aGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMzQ0MjcsImV4cCI6MjA3NTcxMDQyN30.kU7Uz5tdb7M91WDtkwm3-Qgdc4QlHV3YirxqnnL6NFk');
  }

  async getTasks() {
    const { data, error } = await this.supabase.from('tasks').select('*');
    if (error) throw error;
    return data;
  }

  async addTask(task: any) {
    const { data, error } = await this.supabase.from('tasks').insert([task]);
    if (error) throw error;
    return data;
  }
}
