// src/app/pages/home/home.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import {
  TaskDescriptionComponent,
  BoardMember,
} from '../../components/task-description/task-description';
import { CardComponent } from '../../components/card/card';
import { environment } from '../../../../environments/environment';
import { supabase } from '../../core/supabase.client';
import { InvitationService } from '../../services/invitation/invitation.service';

type Board = {
  id?: string;
  title: string;
  color: string;
  background?: string;
  tasks?: any[];
  isOwner?: boolean;
  hasMembers?: boolean;
};

const DEFAULT_COLOR = '#e6f7ff';
const CREATE_COLOR = '#ffffff';
const CREATE_TITLE = 'Tạo bảng mới';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TaskDescriptionComponent, CardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  showPopup = false;
  selectedBoard?: Board;

  cards: Board[] = [];

  loading = false;
  errorMsg = '';

  private readonly apiUrl = environment.apiUrl ?? 'http://localhost:3000';

  constructor(
    private router: Router,
    private http: HttpClient,
    private invitationService: InvitationService,
  ) {}

  // ================= LIFECYCLE =================

  ngOnInit(): void {
    if (environment.useApi) {
      this.loadBoardsFromApi();
    } else {
      this.cards = this.loadBoardsFromLocal();
    }
  }

  ngOnDestroy(): void {
    // hiện tại chưa có listener nào cần xoá
  }

  // ================= POPUP =================

  openPopup(): void {
    this.showPopup = true;
    this.selectedBoard = undefined;
  }

  closePopup(): void {
    this.showPopup = false;
    this.selectedBoard = undefined;
  }

  // ================= CLICK CARD =================

  onCardClick(card: Board, index: number): void {
    if (this.normalizeTitle(card.title) === CREATE_TITLE) {
      this.selectedBoard = undefined;
      this.openPopup();
      return;
    }

    this.selectedBoard = card;
    this.router.navigate(['/card', card.id], {
      state: { board: card },
    });
  }

  // ================= TẠO BOARD MỚI (ĐÃ UPDATE CHECK EMAIL) =================

  async addNewBoard(board?: {
    title?: string;
    color?: string;
    background?: string;
    members?: BoardMember[];
    visibility?: string;
  }) {
    if (!board?.title) return;

    // --- Fallback: localStorage ---
    if (!environment.useApi) {
      const newBoard: Board = {
        id: `${Date.now()}`,
        title: board.title,
        color: board.color ?? '#333333',
        background: board.background ?? '#ffffff',
        isOwner: true,
        hasMembers: false,
      };
      const createIndex = this.cards.findIndex(
        (c) => this.normalizeTitle(c.title) === CREATE_TITLE,
      );
      if (createIndex >= 0) {
        this.cards.splice(createIndex, 0, newBoard);
      } else {
        this.cards.push(newBoard);
      }
      this.persistLocal();
      this.showPopup = false;
      window.dispatchEvent(new CustomEvent('boards:updated'));
      return;
    }

    // --- Dùng API NestJS ---
    try {
      this.loading = true;
      this.errorMsg = '';

      // 1. Tạo Board trước
      const headers = await this.buildAuthHeaders();
      const body = {
        name: board.title,
        description: '',
        color: board.color ?? '#333333',
        background: board.background ?? '#ffffff',
      };

      const created = await this.http
        .post<any>(`${this.apiUrl}/boards`, body, { headers })
        .toPromise();

      const newBoard: Board = {
        id: created?.id,
        title: created?.name ?? board.title,
        color: created?.color ?? body.color,
        background: created?.background ?? body.background,
        isOwner: true,
        hasMembers: false,
      };

      // 2. Xử lý mời thành viên
      const members = board.members ?? [];
      const boardId = newBoard.id;
      const failedInvites: string[] = []; // Danh sách mời thất bại

      // 👇 Regex kiểm tra email chuẩn
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (boardId && members.length > 0) {
        for (const m of members) {
          if (m.type === 'email' && m.name) {

            // 🔥 THÊM CHECK: Định dạng Email
            if (!emailRegex.test(m.name)) {
              failedInvites.push(`${m.name} (Email không đúng định dạng)`);
              continue; // Bỏ qua người này, không gọi API
            }

            try {
              // Gọi API mời từng người
              await this.invitationService.sendInvitation(boardId, m.name);

              // Nếu thành công -> đánh dấu board có member
              newBoard.hasMembers = true;

            } catch (err: any) {
              console.error(`Lỗi khi mời ${m.name}:`, err);

              // Phân loại lỗi từ Backend
              let reason = 'Lỗi không xác định';
              if (err instanceof HttpErrorResponse) {
                if (err.status === 404) reason = 'Người dùng không tồn tại';
                else if (err.status === 409) reason = 'Đã là thành viên hoặc đã mời';
                else if (err.status === 400) reason = 'Yêu cầu không hợp lệ';
              }

              failedInvites.push(`${m.name} (${reason})`);
            }
          }
        }
      }

      // 3. Cập nhật UI
      this.cards.push(newBoard);
      this.showPopup = false;
      window.dispatchEvent(new CustomEvent('boards:updated'));

      // 4. Thông báo kết quả mời (Nếu có lỗi)
      if (failedInvites.length > 0) {
        alert(
          `Bảng đã được tạo thành công!\nTuy nhiên, một số lời mời gửi thất bại:\n\n- ${failedInvites.join('\n- ')}`
        );
      }

    } catch (e: any) {
      console.error('Create board error', e);
      this.errorMsg = 'Không tạo được bảng. Kiểm tra lại kết nối hoặc đăng nhập.';
    } finally {
      this.loading = false;
    }
  }

  // ================= XOÁ BOARD =================
  async deleteBoard(card: Board, index: number) {
    if (this.normalizeTitle(card.title) === CREATE_TITLE) return;

    if (!confirm(`Bạn có chắc muốn xoá bảng "${card.title}" không?`)) {
      return;
    }

    if (environment.useApi) {
      try {
        this.loading = true;
        this.errorMsg = '';
        const headers = await this.buildAuthHeaders();
        await this.http.delete(`${this.apiUrl}/boards/${card.id}`, { headers }).toPromise();
        this.cards.splice(index, 1);
        window.dispatchEvent(new CustomEvent('boards:updated'));
      } catch (e: any) {
        console.error('Delete board error', e);
        this.errorMsg = 'Không xoá được bảng. Kiểm tra lại backend / token.';
      } finally {
        this.loading = false;
      }
      return;
    }

    this.cards.splice(index, 1);
    this.persistLocal();
    window.dispatchEvent(new CustomEvent('boards:updated'));
  }

  // ================= LOAD TỪ API =================
  private async loadBoardsFromApi() {
    try {
      this.loading = true;
      this.errorMsg = '';
      const headers = await this.buildAuthHeaders();
      const apiBoards = await this.http.get<any[]>(`${this.apiUrl}/boards`, { headers }).toPromise();
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData.user?.id;

      const boards: Board[] = (apiBoards ?? []).map((b: any) => ({
        id: String(b.id),
        title: String(b.name ?? '').trim(),
        color: b.color ?? DEFAULT_COLOR,
        background: b.background ?? b.color ?? DEFAULT_COLOR,
        tasks: [],
        isOwner: currentUserId ? b.owner_id === currentUserId : true,
        hasMembers: !!b.has_members,
      }));

      boards.push({
        id: 'create',
        title: CREATE_TITLE,
        color: CREATE_COLOR,
        background: CREATE_COLOR,
        isOwner: true,
        hasMembers: false,
      });

      this.cards = boards;
    } catch (e: any) {
      console.error('Load boards error', e);
      this.errorMsg = 'Không tải được danh sách bảng. Có thể chưa đăng nhập Supabase.';
      this.cards = this.loadBoardsFromLocal();
    } finally {
      this.loading = false;
    }
  }

  // ================= AUTH HEADER =================
  private async buildAuthHeaders(): Promise<HttpHeaders> {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.access_token) {
      throw new Error('Chưa có Supabase session (chưa đăng nhập).');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${data.session.access_token}`,
      'Content-Type': 'application/json',
    });
  }

  // ================= GETTERS & HELPERS =================
  get invitedGroupBoards(): Board[] {
    return this.cards.filter((b) => this.normalizeTitle(b.title) !== CREATE_TITLE && !b.isOwner);
  }
  get myOwnedSoloBoards(): Board[] {
    return this.cards.filter((b) => b.isOwner && !b.hasMembers && this.normalizeTitle(b.title) !== 'Tạo bảng mới');
  }
  get myGroupBoards(): Board[] {
    return this.cards.filter((b) => b.isOwner && b.hasMembers && this.normalizeTitle(b.title) !== 'Tạo bảng mới');
  }
  normalizeTitle(t?: string): string {
    return String(t ?? '').replace(/^\+?\s*/, '').trim();
  }
  private loadBoardsFromLocal(): Board[] {
    let raw: any[] = [];
    try {
      raw = JSON.parse(localStorage.getItem('boards') ?? '[]');
      if (!Array.isArray(raw)) raw = [];
    } catch {
      raw = [];
    }
    const boards: Board[] = raw.map((b: any, i: number): Board => ({
      id: b?.id ?? `${Date.now()}-${i}`,
      title: String(b?.title ?? '').trim(),
      background: String(b?.background ?? b?.color ?? DEFAULT_COLOR),
      color: String(b?.color ?? b?.background ?? DEFAULT_COLOR),
      tasks: Array.isArray(b?.tasks) ? b.tasks : [],
      isOwner: true,
      hasMembers: false,
    })).filter((b: Board) => b.title.length > 0 && this.normalizeTitle(b.title) !== CREATE_TITLE);

    boards.push({
      id: 'create',
      title: CREATE_TITLE,
      color: CREATE_COLOR,
      background: CREATE_COLOR,
      isOwner: true,
      hasMembers: false,
    });
    return boards;
  }
  private persistLocal(): void {
    try {
      const normalized: Board[] = this.cards.map((b: Board): Board => ({
        id: b.id ?? `${Date.now()}`,
        title: String(b.title ?? '').trim(),
        background: b.background ?? b.color ?? DEFAULT_COLOR,
        color: b.color ?? b.background ?? DEFAULT_COLOR,
        tasks: Array.isArray(b.tasks) ? b.tasks : [],
        isOwner: b.isOwner,
        hasMembers: b.hasMembers,
      })).filter((b: Board) => b.title.length > 0 && this.normalizeTitle(b.title) !== CREATE_TITLE);
      localStorage.setItem('boards', JSON.stringify(normalized));
    } catch (e) { console.error('Persist boards error:', e); }
  }
}
