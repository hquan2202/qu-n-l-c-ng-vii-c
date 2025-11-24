// src/app/pages/home/home.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { TaskDescriptionComponent } from '../../components/task-description/task-description';
import { CardComponent } from '../../components/card/card';
import { environment } from '../../../../environments/environment';
import { supabase } from '../../core/supabase.client';

type Board = {
  id?: string;
  title: string;
  color: string;
  background?: string;
  tasks?: any[];
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

  // ================= TẠO BOARD MỚI =================

  async addNewBoard(board?: { title?: string; color?: string; background?: string }) {
    if (!board?.title) return;

    // --- Fallback: localStorage ---
    if (!environment.useApi) {
      const newBoard: Board = {
        id: `${Date.now()}`,
        title: board.title,
        color: board.color ?? '#333333',
        background: board.background ?? '#ffffff',
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

      // thông báo cho Sidebar reload
      window.dispatchEvent(new CustomEvent('boards:updated'));
      return;
    }

    // --- Dùng API NestJS ---
    try {
      this.loading = true;
      this.errorMsg = '';

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
      };

      this.cards.push(newBoard);

      this.showPopup = false;
      // cho Sidebar reload
      window.dispatchEvent(new CustomEvent('boards:updated'));
    } catch (e: any) {
      console.error('Create board error', e);
      this.errorMsg = 'Không tạo được bảng. Kiểm tra lại login hoặc backend.';
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

    // --- Dùng API ---
    if (environment.useApi) {
      try {
        this.loading = true;
        this.errorMsg = '';

        const headers = await this.buildAuthHeaders();
        await this.http
          .delete(`${this.apiUrl}/boards/${card.id}`, { headers })
          .toPromise();

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

    // --- Fallback: localStorage ---
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

      const apiBoards = await this.http
        .get<any[]>(`${this.apiUrl}/boards`, { headers })
        .toPromise();

      const boards: Board[] = (apiBoards ?? []).map((b: any) => ({
        id: String(b.id),
        title: String(b.name ?? '').trim(),
        color: b.color ?? DEFAULT_COLOR,
        background: b.background ?? b.color ?? DEFAULT_COLOR,
        tasks: [],
      }));

      // luôn thêm card "Tạo bảng mới"
      boards.push({
        id: 'create',
        title: CREATE_TITLE,
        color: CREATE_COLOR,
        background: CREATE_COLOR,
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

  // ================= AUTH HEADER (SUPABASE) =================

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

  // ================= LOCALSTORAGE HELPER =================

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

    const boards: Board[] = raw
      .map(
        (b: any, i: number): Board => ({
          id: b?.id ?? `${Date.now()}-${i}`,
          title: String(b?.title ?? '').trim(),
          background: String(b?.background ?? b?.color ?? DEFAULT_COLOR),
          color: String(b?.color ?? b?.background ?? DEFAULT_COLOR),
          tasks: Array.isArray(b?.tasks) ? b.tasks : [],
        }),
      )
      .filter(
        (b: Board) =>
          b.title.length > 0 && this.normalizeTitle(b.title) !== CREATE_TITLE,
      );

    boards.push({
      id: 'create',
      title: CREATE_TITLE,
      color: CREATE_COLOR,
      background: CREATE_COLOR,
    });

    return boards;
  }

  private persistLocal(): void {
    try {
      const normalized: Board[] = this.cards
        .map(
          (b: Board): Board => ({
            id: b.id ?? `${Date.now()}`,
            title: String(b.title ?? '').trim(),
            background: b.background ?? b.color ?? DEFAULT_COLOR,
            color: b.color ?? b.background ?? DEFAULT_COLOR,
            tasks: Array.isArray(b.tasks) ? b.tasks : [],
          }),
        )
        .filter(
          (b: Board) =>
            b.title.length > 0 && this.normalizeTitle(b.title) !== CREATE_TITLE,
        );

      localStorage.setItem('boards', JSON.stringify(normalized));
    } catch (e) {
      console.error('Persist boards error:', e);
    }
  }
}
