// src/app/share/sidebar/sidebar.ts
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { supabase } from '../../core/supabase.client';

type Board = {
  id: string;
  title: string;
  color?: string;
  background?: string;
  tasks?: any[];
  isOwner?: boolean;
  hasMembers?: boolean;
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf, NgFor, MatIconModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit, OnDestroy {
  myBoardsOwned: Board[] = [];     // nếu muốn giữ thì vẫn được
  mySoloBoards: Board[] = [];      // 👈 bảng cá nhân
  myGroupsOwned: Board[] = [];     // nhóm của tôi (owner + có member)
  myGroupsInvited: Board[] = [];   // nhóm tôi được mời


  isBoardsOpen = true;
  isTeamsOpen = true;

  private readonly apiUrl = environment.apiUrl ?? 'http://localhost:3000';
  private onBoardsUpdatedBound = this.reloadFromApi.bind(this);

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.reloadFromApi();

    window.addEventListener(
      'boards:updated',
      this.onBoardsUpdatedBound as EventListener,
    );
  }

  ngOnDestroy(): void {
    window.removeEventListener(
      'boards:updated',
      this.onBoardsUpdatedBound as EventListener,
    );
  }

  // ================== API ==================

  private async buildAuthHeaders(): Promise<HttpHeaders> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token ?? '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  private async reloadFromApi() {
    try {
      const headers = await this.buildAuthHeaders();
      const apiBoards = await this.http
        .get<any[]>(`${this.apiUrl}/boards`, { headers })
        .toPromise();

      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData.user?.id;

      const allBoards: Board[] = (apiBoards ?? []).map((b: any) => ({
        id: String(b.id),
        title: String(b.name ?? b.title ?? '').trim() || 'Untitled',
        color: b.color ?? '#333333',
        background: b.background ?? b.color ?? '#ffffff',
        tasks: Array.isArray(b.tasks) ? b.tasks : [],
        isOwner: currentUserId ? b.owner_id === currentUserId : true,
        hasMembers: !!b.has_members,
      }));

      this.myBoardsOwned   = allBoards.filter((b) => b.isOwner);
      this.mySoloBoards    = allBoards.filter((b) => b.isOwner && !b.hasMembers); // 👈
      this.myGroupsOwned   = allBoards.filter((b) => b.isOwner && b.hasMembers);
      this.myGroupsInvited = allBoards.filter((b) => !b.isOwner);


      this.cdr.markForCheck();
    } catch (e) {
      console.error('[Sidebar] Lỗi tải boards từ API', e);
      this.myBoardsOwned = [];
      this.myGroupsOwned = [];
      this.myGroupsInvited = [];
      this.cdr.markForCheck();
    }
  }

  // ================== UI HELPERS ==================

  trackById(_: number, b: Board) {
    return b.id;
  }

  toggleBoards() {
    this.isBoardsOpen = !this.isBoardsOpen;
  }

  toggleTeams() {
    this.isTeamsOpen = !this.isTeamsOpen;
  }
}
