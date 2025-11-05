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
  /** Khoá cũ (trước đây lưu chung) – dùng cho migrate */
  private static readonly LEGACY_KEY = 'my_app_columns';
  /** Prefix mới: mỗi board 1 khoá riêng */
  private static readonly STORAGE_PREFIX = 'my_app_columns::';

  /** board đang hoạt động */
  private activeBoardId: string | null = null;

  /** trạng thái cột của board hiện tại */
  private columnsSubject = new BehaviorSubject<Column[]>([]);
  public readonly columns$ = this.columnsSubject.asObservable();

  constructor() {
    // đồng bộ nhiều tab: nếu cùng boardId thì reload
    window.addEventListener('storage', (e: StorageEvent) => {
      if (!this.activeBoardId) return;
      if (e.key === this.keyFor(this.activeBoardId)) {
        this.columnsSubject.next(this.safeParseColumns(e.newValue) ?? this.defaultColumns());
      }
    });
  }

  /** Gọi khi vào /card/:id để chọn board đang hoạt động */
  setActiveBoardId(id: string): void {
    if (!id) return;
    if (id === this.activeBoardId) return;

    this.activeBoardId = id;

    // migrate từ khoá cũ nếu tồn tại và board mới chưa có dữ liệu
    this.migrateLegacyIfNeeded(id);

    // nạp dữ liệu cho board này
    const cols = this.loadFromStorage(id);
    this.columnsSubject.next(cols);
  }

  /** Nạp lại dữ liệu từ storage (nếu bạn muốn chủ động) */
  loadBoard(id: string): void {
    this.setActiveBoardId(id);
  }

  /** Tạo board rỗng nếu chưa có */
  initBoardIfMissing(id: string): void {
    const key = this.keyFor(id);
    if (!localStorage.getItem(key)) {
      const cols = this.defaultColumns();
      localStorage.setItem(key, JSON.stringify(cols));
    }
    if (this.activeBoardId === id) {
      this.columnsSubject.next(this.loadFromStorage(id));
    }
  }

  // ----------------- Column CRUD (theo board hiện tại) -----------------

  addColumn(title: string): void {
    if (!this.ensureActive()) return;
    if (!title || !title.trim()) return;

    const add = { title: title.trim(), cards: [], newCardName: '' };
    const cols = [...this.columnsSubject.value, add];
    this.columnsSubject.next(cols);
    this.persist(cols);
  }

  deleteColumn(index: number): void {
    if (!this.ensureActive()) return;
    const cols = this.columnsSubject.value.slice();
    if (index < 0 || index >= cols.length) return;
    cols.splice(index, 1);
    this.columnsSubject.next(cols);
    this.persist(cols);
  }

  addCard(columnIndex: number, cardTitle: string): void {
    if (!this.ensureActive()) return;
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
    if (!this.ensureActive()) return;

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
    if (!this.ensureActive()) return;

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

  // ----------------- Storage helpers -----------------

  private loadFromStorage(boardId: string): Column[] {
    const key = this.keyFor(boardId);
    const cols = this.safeParseColumns(localStorage.getItem(key));
    return cols ?? this.defaultColumns();
  }

  private persist(cols: Column[]): void {
    if (!this.activeBoardId) return; // không có board đang hoạt động thì bỏ qua
    try {
      localStorage.setItem(this.keyFor(this.activeBoardId), JSON.stringify(cols));
      // Nếu cần thông báo cho phần khác (không phải Sidebar), có thể dispatch sự kiện riêng:
      // window.dispatchEvent(new CustomEvent('columns:updated', { detail: { boardId: this.activeBoardId }}));
    } catch (e) {
      console.error('BoardService persist error', e);
    }
  }

  private safeParseColumns(json: string | null): Column[] | null {
    if (!json) return null;
    try {
      const parsed = JSON.parse(json);
      return Array.isArray(parsed) ? parsed as Column[] : null;
    } catch {
      return null;
    }
  }

  private defaultColumns(): Column[] {
    return [
      { title: 'To Do',        cards: [], newCardName: '' },
      { title: 'In Progress',  cards: [], newCardName: '' },
      { title: 'Done',         cards: [], newCardName: '' },
    ];
  }

  private keyFor(boardId: string): string {
    return `${BoardService.STORAGE_PREFIX}${boardId}`;
  }

  private ensureActive(): boolean {
    if (!this.activeBoardId) {
      console.warn('BoardService: no activeBoardId. Call setActiveBoardId(id) first.');
      return false;
    }
    return true;
  }

  /** Di trú dữ liệu cũ (lưu chung) sang khoá riêng của board lần đầu */
  private migrateLegacyIfNeeded(targetBoardId: string): void {
    const legacy = localStorage.getItem(BoardService.LEGACY_KEY);
    if (!legacy) return;

    const targetKey = this.keyFor(targetBoardId);
    if (localStorage.getItem(targetKey)) return; // board đã có dữ liệu riêng → không ghi đè

    const cols = this.safeParseColumns(legacy) ?? this.defaultColumns();
    localStorage.setItem(targetKey, JSON.stringify(cols));

    // KHÔNG xoá LEGACY ngay để không mất dữ liệu của các board khác chưa di trú (nếu có).
    // Bạn có thể quyết định xoá sau khi toàn bộ boards đã migrate.
    // localStorage.removeItem(BoardService.LEGACY_KEY);
  }
}
