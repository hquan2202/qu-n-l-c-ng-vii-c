import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://ddumqkjqiuheppgdvhiy.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdW1xa2pxaXVoZXBwZ2R2aGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMzQ0MjcsImV4cCI6MjA3NTcxMDQyN30.kU7Uz5tdb7M91WDtkwm3-Qgdc4QlHV3YirxqnnL6NFk'
    );
  }

  // 🟩 Lấy danh sách board
  async getBoards(): Promise<{ data: any[] | null; error: any }> {
    const { data, error } = await this.supabase
      .from('boards') // đổi đúng tên bảng
      .select('*')
      .order('created_at', { ascending: true });
    return { data, error };
  }

  // 🟦 Thêm board mới
  async addBoard(board: { title: string; color: string }): Promise<{ data: any[] | null; error: any }> {
    const { data, error } = await this.supabase.from('boards').insert([board]).select();
    return { data, error };
  }

  // 🟥 Xóa board theo id (uuid hoặc string)
  async deleteBoard(id: string): Promise<{ error: any }> {
    const { error } = await this.supabase.from('boards').delete().eq('id', id);
    return { error };
  }
}
