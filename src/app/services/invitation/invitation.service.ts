// src/app/core/invitation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { supabase } from '../../core/supabase.client';

@Injectable({
  providedIn: 'root',
})
export class InvitationService {
  private readonly apiUrl = environment.apiUrl ?? 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  /** Lấy token Supabase để gọi BE NestJS */
  private async buildAuthHeaders(): Promise<HttpHeaders> {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.access_token) {
      throw new Error('Missing Supabase session');
    }

    return new HttpHeaders({
      Authorization: `Bearer ${data.session.access_token}`,
      'Content-Type': 'application/json',
    });
  }

  // ===== Lời mời dành cho user hiện tại =====
  async getMyInvitations(): Promise<any[]> {
    const headers = await this.buildAuthHeaders();

    const res = await this.http
      .get<any[]>(`${this.apiUrl}/boards/invitations/me`, { headers })
      .toPromise();

    return res ?? [];
  }

  // ===== Accept invitation =====
  async acceptInvitation(invitationId: string): Promise<any> {
    const headers = await this.buildAuthHeaders();

    return this.http
      .post<any>(
        `${this.apiUrl}/boards/invitations/${invitationId}/accept`,
        {},
        { headers },
      )
      .toPromise();
  }

  // ===== Reject invitation =====
  async rejectInvitation(invitationId: string): Promise<any> {
    const headers = await this.buildAuthHeaders();

    return this.http
      .post<any>(
        `${this.apiUrl}/boards/invitations/${invitationId}/reject`,
        {},
        { headers },
      )
      .toPromise();
  }

  // ===== Gửi lời mời vào 1 board =====
  async sendInvitation(boardId: string, email: string): Promise<any> {
    const headers = await this.buildAuthHeaders();

    return this.http
      .post<any>(
        `${this.apiUrl}/boards/${boardId}/invite`,
        { email },
        { headers },
      )
      .toPromise();
  }


}

