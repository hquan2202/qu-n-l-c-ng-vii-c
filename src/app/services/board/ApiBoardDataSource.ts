// src/app/services/board/ApiBoardDataSource.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { IBoardDataSource, Column, Card } from './IBoardDataSource';
import { environment } from '../../../../environments/environment';
import { supabase } from '../../core/supabase.client';

@Injectable({ providedIn: 'root' })
export class ApiBoardDataSource implements IBoardDataSource {
  private readonly apiUrl = environment.apiUrl ?? 'http://localhost:3000';

  private boardId: string | null = null;

  private _columns$ = new BehaviorSubject<Column[]>([]);
  public readonly columns$ = this._columns$.asObservable();

  constructor(private http: HttpClient) {}

  // ====== helper: header Authorization từ Supabase ======
  private async buildAuthHeaders(): Promise<HttpHeaders> {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.access_token) {
      throw new Error('Chưa đăng nhập Supabase – không có access_token');
    }

    return new HttpHeaders({
      Authorization: `Bearer ${data.session.access_token}`,
      'Content-Type': 'application/json',
    });
  }

  // ====== load board ======
  async setActiveBoardId(id: string): Promise<void> {
    if (!id || id === this.boardId) return;
    this.boardId = id;
    await this.loadBoard(id);
  }

  async loadBoard(id: string): Promise<void> {
    if (!id) return;
    this.boardId = id;

    const headers = await this.buildAuthHeaders();

    const [board, cols, cards] = await Promise.all([
      this.http.get<any>(`${this.apiUrl}/boards/${id}`, { headers }).toPromise(),
      this.http.get<any[]>(`${this.apiUrl}/boards/${id}/columns`, { headers }).toPromise(),
      this.http.get<any[]>(`${this.apiUrl}/boards/${id}/cards`, { headers }).toPromise(),
      this.http
        .get<any[]>(`${this.apiUrl}/boards/${id}/columns`, { headers })
        .toPromise(),
      this.http
        .get<any[]>(`${this.apiUrl}/boards/${id}/cards`, { headers })
        .toPromise(),

    ]);
    this._boardInfo$.next(board);

    const columns: Column[] = (cols ?? []).map((c: any) => ({
      id: c.id,
      title: c.title ?? 'Untitled',
      cards: [],
      newCardName: '',
    }));

    const colMap = new Map<string, Column>();
    columns.forEach((c) => c.id && colMap.set(c.id, c));

    (cards ?? []).forEach((r: any) => {
      const col = colMap.get(r.columnId ?? r.column_id); // backend trả columnId
      if (!col) return;

      const card: Card = {
        id: r.id,
        title: r.title ?? '',
        status: r.status ?? 'To Do',
        assignee: r.assignee ?? '',
        description: r.description ?? '',
      };
      col.cards.push(card);
    });

    this._columns$.next(columns);
  }


  // ====== column CRUD ======
  async addColumn(title: string): Promise<void> {
    if (!this.boardId || !title.trim()) return;
    const headers = await this.buildAuthHeaders();

    const body = {
      boardId: this.boardId,
      title: title.trim(),
    };

    // ✅ KHÔNG có /boards ở đây
    const created = await this.http
      .post<any>(`${this.apiUrl}/boards/columns`, body, { headers })
      .toPromise();

    const newCol: Column = {
      id: created?.id,
      title: created?.title ?? body.title,
      cards: [],
      newCardName: '',
    };

    this._columns$.next([...this._columns$.value, newCol]);
  }

  async deleteColumn(index: number): Promise<void> {
    const cols = [...this._columns$.value];
    if (index < 0 || index >= cols.length) return;
    const col = cols[index];
    if (!col.id) return;

    const headers = await this.buildAuthHeaders();

    // ✅ KHÔNG có /boards ở đây
    await this.http
      .delete(`${this.apiUrl}/boards/columns/${col.id}`, { headers })
      .toPromise();

    cols.splice(index, 1);
    this._columns$.next(cols);
  }

// ====== card CRUD ======
  async addCard(columnIndex: number, title: string): Promise<void> {
    const cols = [...this._columns$.value];
    const col = cols[columnIndex];
    if (!this.boardId || !col?.id || !title.trim()) return;

    const headers = await this.buildAuthHeaders();
    const body = {
      boardId: this.boardId,
      columnId: col.id,
      title: title.trim(),
    };

    // ✅ KHÔNG có /boards ở đây
    const created = await this.http
      .post<any>(`${this.apiUrl}/boards/cards`, body, { headers })
      .toPromise();

    const card: Card = {
      id: created?.id,
      title: created?.title ?? body.title,
      status: created?.status ?? 'To Do',
      assignee: created?.assignee ?? '',
      description: created?.description ?? '',
    };

    col.cards = [...col.cards, card];
    cols[columnIndex] = col;
    this._columns$.next(cols);
  }

  async updateCard(
    columnIndex: number,
    cardIndex: number,
    card: Card,
  ): Promise<void> {
    const cols = [...this._columns$.value];
    const col = cols[columnIndex];
    if (!col) return;

    const old = col.cards[cardIndex];
    if (!old || !old.id) return;

    const headers = await this.buildAuthHeaders();

    const body = {
      title: card.title,
      status: card.status,
      assignee: card.assignee,
      description: card.description,
    };

    // ✅ KHÔNG có /boards ở đây
    const updated = await this.http
      .patch<any>(`${this.apiUrl}/boards/cards/${old.id}`, body, { headers })
      .toPromise();

    col.cards[cardIndex] = {
      ...old,
      ...card,
      id: updated?.id ?? old.id,
    };
    cols[columnIndex] = col;
    this._columns$.next(cols);
  }

  async deleteCard(columnIndex: number, cardIndex: number): Promise<void> {
    const cols = [...this._columns$.value];
    const col = cols[columnIndex];
    if (!col) return;

    const card = col.cards[cardIndex];
    if (!card?.id) return;

    const headers = await this.buildAuthHeaders();

    // ✅ KHÔNG có /boards ở đây
    await this.http
      .delete(`${this.apiUrl}/boards/cards/${card.id}`, { headers })
      .toPromise();

    col.cards.splice(cardIndex, 1);
    cols[columnIndex] = col;
    this._columns$.next(cols);
  }

  private _boardInfo$ = new BehaviorSubject<any>(null);
  public readonly boardInfo$ = this._boardInfo$.asObservable();

}
