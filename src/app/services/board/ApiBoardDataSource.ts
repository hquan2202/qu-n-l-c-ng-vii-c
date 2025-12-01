// src/app/services/board/ApiBoardDataSource.ts

import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { IBoardDataSource, Column, Card } from './IBoardDataSource';
import { environment } from '../../../../environments/environment';
import { supabase } from '../../core/supabase.client';

@Injectable({ providedIn: 'root' })
export class ApiBoardDataSource implements IBoardDataSource {
  private readonly apiUrl = environment.apiUrl ?? 'http://localhost:3000';
  private boardId: string | null = null;

  // State quản lý Columns
  private _columns$ = new BehaviorSubject<Column[]>([]);
  public readonly columns$ = this._columns$.asObservable();

  // State quản lý Board Info (Background, Members, Title...)
  private _boardInfo$ = new BehaviorSubject<any>(null);
  public readonly boardInfo$ = this._boardInfo$.asObservable();

  constructor(
    private http: HttpClient,
    private zone: NgZone // <--- 1. Inject NgZone để xử lý Async
  ) {}

  // ============================================================
  // AUTH HEADER HELPER
  // ============================================================
  private async buildAuthHeaders(): Promise<HttpHeaders> {
    // Lấy session từ Supabase (Hàm này chạy ngoài Angular Zone)
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session?.access_token) {
      console.error('Supabase Session Error:', error);
      throw new Error('Chưa đăng nhập Supabase – không có access_token');
    }

    return new HttpHeaders({
      Authorization: `Bearer ${data.session.access_token}`,
      'Content-Type': 'application/json',
    });
  }

  // ============================================================
  // LOAD DATA (CORE)
  // ============================================================
  async setActiveBoardId(id: string): Promise<void> {
    if (!id || id === this.boardId) return;
    this.boardId = id;
    await this.loadBoard(id);
  }

  async loadBoard(id: string): Promise<void> {
    if (!id) return;
    this.boardId = id;

    try {
      const headers = await this.buildAuthHeaders();

      // Gọi song song 3 API để lấy dữ liệu
      const [board, cols, cards] = await Promise.all([
        lastValueFrom(this.http.get<any>(`${this.apiUrl}/boards/${id}`, { headers })),
        lastValueFrom(this.http.get<any[]>(`${this.apiUrl}/boards/${id}/columns`, { headers })),
        lastValueFrom(this.http.get<any[]>(`${this.apiUrl}/boards/${id}/cards`, { headers })),
      ]);

      console.log('✅ API LOAD SUCCESS:', { board, colsCount: cols?.length, cardsCount: cards?.length });

      // 1. Xử lý Board Info
      const boardInfo = this.buildBoardInfo(board);

      // 2. Xử lý Columns & Cards
      const columns: Column[] = (cols ?? []).map((c: any) => ({
        id: c.id,
        title: c.title ?? 'Untitled',
        cards: [], // Sẽ fill card vào bên dưới
        newCardName: '',
      }));

      // Map Card vào Column tương ứng
      const colMap = new Map<string, Column>();
      columns.forEach((c) => c.id && colMap.set(c.id, c));

      (cards ?? []).forEach((r: any) => {
        const colId = r.columnId ?? r.column_id;
        const col = colMap.get(colId);
        if (col) {
          const card: Card = {
            id: r.id,
            title: r.title ?? '',
            status: r.status ?? 'To Do',
            assignee: r.assignee ?? '',
            description: r.description ?? '',
          };
          col.cards.push(card);
        }
      });

      // 3. 🔥 FIX: Đẩy dữ liệu về trong NgZone để UI cập nhật
      this.zone.run(() => {
        console.log('🔄 Emitting data inside NgZone...');
        this._boardInfo$.next(boardInfo);
        this._columns$.next(columns);
      });

    } catch (error) {
      console.error('❌ Error loading board:', error);
    }
  }

  private buildBoardInfo(raw: any): any {
    if (!raw) return null;
    return {
      id: raw.id,
      name: raw.name ?? raw.title ?? 'Untitled',
      description: raw.description ?? '',
      color: raw.color ?? '#333333',
      background: raw.background ?? '',
      // Quan trọng: Đảm bảo luôn trả về mảng
      members: Array.isArray(raw.members) ? raw.members : [],
    };
  }

  // ============================================================
  // COLUMN CRUD
  // ============================================================
  async addColumn(title: string): Promise<void> {
    if (!this.boardId || !title.trim()) return;

    try {
      const headers = await this.buildAuthHeaders();
      const body = { boardId: this.boardId, title: title.trim() };

      const created = await lastValueFrom(
        this.http.post<any>(`${this.apiUrl}/boards/columns`, body, { headers })
      );

      const newCol: Column = {
        id: created?.id,
        title: created?.title ?? body.title,
        cards: [],
        newCardName: '',
      };

      // Cập nhật UI trong Zone
      this.zone.run(() => {
        const current = this._columns$.value;
        this._columns$.next([...current, newCol]);
      });

    } catch (error) {
      console.error('Error adding column', error);
    }
  }

  async deleteColumn(index: number): Promise<void> {
    const cols = [...this._columns$.value];
    const col = cols[index];
    if (!col?.id) return;

    try {
      const headers = await this.buildAuthHeaders();
      await lastValueFrom(
        this.http.delete(`${this.apiUrl}/boards/columns/${col.id}`, { headers })
      );

      // Cập nhật UI trong Zone
      this.zone.run(() => {
        cols.splice(index, 1);
        this._columns$.next(cols);
      });
    } catch (error) {
      console.error('Error deleting column', error);
    }
  }

  // ============================================================
  // CARD CRUD
  // ============================================================
  async addCard(columnIndex: number, title: string): Promise<void> {
    const cols = [...this._columns$.value];
    const col = cols[columnIndex];
    if (!this.boardId || !col?.id || !title.trim()) return;

    try {
      const headers = await this.buildAuthHeaders();
      const body = {
        boardId: this.boardId,
        columnId: col.id,
        title: title.trim(),
      };

      const created = await lastValueFrom(
        this.http.post<any>(`${this.apiUrl}/boards/cards`, body, { headers })
      );

      const card: Card = {
        id: created?.id,
        title: created?.title ?? body.title,
        status: created?.status ?? 'To Do',
        assignee: created?.assignee ?? '',
        description: created?.description ?? '',
      };

      // Cập nhật UI trong Zone
      this.zone.run(() => {
        col.cards = [...col.cards, card];
        cols[columnIndex] = col;
        this._columns$.next(cols);
      });

    } catch (error) {
      console.error('Error adding card', error);
    }
  }

  async updateCard(columnIndex: number, cardIndex: number, cardData: Card): Promise<void> {
    const cols = [...this._columns$.value];
    const col = cols[columnIndex];
    const oldCard = col?.cards[cardIndex];

    if (!oldCard?.id) return;

    try {
      const headers = await this.buildAuthHeaders();
      const body = {
        title: cardData.title,
        status: cardData.status,
        assignee: cardData.assignee,
        description: cardData.description,
      };

      const updated = await lastValueFrom(
        this.http.patch<any>(`${this.apiUrl}/boards/cards/${oldCard.id}`, body, { headers })
      );

      // Cập nhật UI trong Zone
      this.zone.run(() => {
        col.cards[cardIndex] = { ...oldCard, ...cardData, id: updated?.id ?? oldCard.id };
        cols[columnIndex] = col;
        this._columns$.next(cols);
      });

    } catch (error) {
      console.error('Error updating card', error);
    }
  }

  async deleteCard(columnIndex: number, cardIndex: number): Promise<void> {
    const cols = [...this._columns$.value];
    const col = cols[columnIndex];
    const card = col?.cards[cardIndex];

    if (!card?.id) return;

    try {
      const headers = await this.buildAuthHeaders();
      await lastValueFrom(
        this.http.delete(`${this.apiUrl}/boards/cards/${card.id}`, { headers })
      );

      // Cập nhật UI trong Zone
      this.zone.run(() => {
        col.cards.splice(cardIndex, 1);
        cols[columnIndex] = col;
        this._columns$.next(cols);
      });

    } catch (error) {
      console.error('Error deleting card', error);
    }
  }
}
