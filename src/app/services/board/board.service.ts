import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Card {
  title: string;
  status?: string;
  assignee?: string;
  description?: string;
}

export interface Column {
  title: string;
  cards: Card[];
  newCardName?: string;
}

@Injectable({ providedIn: 'root' })
export class BoardService {
  private readonly STORAGE_KEY = 'my_app_columns';
  private columnsSubject = new BehaviorSubject<Column[]>(this.loadFromStorage());
  public columns$ = this.columnsSubject.asObservable();

  private loadFromStorage(): Column[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return this.defaultColumns();
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : this.defaultColumns();
    } catch {
      return this.defaultColumns();
    }
  }

  private defaultColumns(): Column[] {
    return [
      { title: 'To Do', cards: [], newCardName: '' },
      { title: 'In Progress', cards: [], newCardName: '' },
      { title: 'Done', cards: [], newCardName: '' }
    ];
  }

  private persist(cols: Column[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cols));
      window.dispatchEvent(new CustomEvent('boards:updated'));
    } catch (e) {
      console.error('BoardService persist error', e);
    }
  }

  addColumn(title: string): void {
    if (!title || !title.trim()) return;
    const cols = [...this.columnsSubject.value, { title: title.trim(), cards: [], newCardName: '' }];
    this.columnsSubject.next(cols);
    this.persist(cols);
  }

  deleteColumn(index: number): void {
    const cols = this.columnsSubject.value.slice();
    if (index < 0 || index >= cols.length) return;
    cols.splice(index, 1);
    this.columnsSubject.next(cols);
    this.persist(cols);
  }

  addCard(columnIndex: number, cardTitle: string): void {
    if (!cardTitle || !cardTitle.trim()) return;
    const cols = this.columnsSubject.value.map((c, idx) =>
      idx === columnIndex
        ? {
          ...c,
          cards: [
            ...c.cards,
            { title: cardTitle.trim(), status: 'To Do', assignee: '', description: '' }
          ]
        }
        : c
    );
    this.columnsSubject.next(cols);
    this.persist(cols);
  }

  updateCard(columnIndex: number, cardIndex: number, card: Card): void {
    const cols = this.columnsSubject.value.map((c, ci) => {
      if (ci !== columnIndex) return c;
      const cards = c.cards.slice();
      if (cardIndex < 0 || cardIndex >= cards.length) return c;
      cards[cardIndex] = { ...card };
      return { ...c, cards };
    });
    this.columnsSubject.next(cols);
    this.persist(cols);
  }

  deleteCard(columnIndex: number, cardIndex: number): void {
    const cols = this.columnsSubject.value.map((c, ci) => {
      if (ci !== columnIndex) return c;
      const cards = c.cards.slice();
      if (cardIndex < 0 || cardIndex >= cards.length) return c;
      cards.splice(cardIndex, 1);
      return { ...c, cards };
    });
    this.columnsSubject.next(cols);
    this.persist(cols);
  }
}
