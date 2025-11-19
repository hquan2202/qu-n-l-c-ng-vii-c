// typescript
// File: `src/app/services/board/board.service.ts`
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TaskService } from '../task/task.service';

export interface Card {
  title: string;
  status?: string;
  assignee?: string;
  description?: string;
  taskId?: string;
}

export interface Column {
  title: string;
  cards: Card[];
  newCardName?: string;
}

@Injectable({ providedIn: 'root' })
export class BoardService {
  private static readonly STORAGE_PREFIX = 'my_app_columns::';

  private activeBoardId: string | null = null;
  private columnsSubject = new BehaviorSubject<Column[]>([]);
  public readonly columns$ = this.columnsSubject.asObservable();

  constructor(private taskService: TaskService) {
    window.addEventListener('storage', (e: StorageEvent) => {
      if (!this.activeBoardId) return;
      if (e.key === this.keyFor(this.activeBoardId)) {
        this.columnsSubject.next(this.safeParseColumns(e.newValue) ?? this.defaultColumns());
      }
    });
  }

  setActiveBoardId(id: string): void {
    if (!id || id === this.activeBoardId) return;
    this.activeBoardId = id;
    this.initBoardIfMissing(id);
  }

  loadBoard(id: string): void {
    this.setActiveBoardId(id);
  }

  initBoardIfMissing(id: string): void {
    const key = this.keyFor(id);
    if (!localStorage.getItem(key)) {
      const cols = this.defaultColumns();
      localStorage.setItem(key, JSON.stringify(cols));
    }

    // ✅ giữ nguyên cards trong localStorage
    const cols = this.loadFromStorage(id).map(col => ({
      ...col,
      newCardName: '',
    }));

    this.columnsSubject.next(cols);
    this.persist(cols);
  }

  addColumn(title: string): void {
    if (!this.ensureActive() || !title?.trim()) return;
    const cols = [...this.columnsSubject.value, { title: title.trim(), cards: [], newCardName: '' }];
    this.columnsSubject.next(cols);
    this.persist(cols);
  }

  deleteColumn(index: number): void {
    if (!this.ensureActive()) return;
    const cols = this.columnsSubject.value.slice();
    if (index < 0 || index >= cols.length) return;

    // capture taskIds before mutating
    const taskIds = (cols[index]?.cards ?? []).map(c => c.taskId).filter(Boolean) as string[];

    // remove column locally
    cols.splice(index, 1);
    this.columnsSubject.next(cols);
    this.persist(cols);

    // delete corresponding tasks so All Tasks page removes them
    try {
      taskIds.forEach(id => {
        if (id) this.taskService.deleteTask(id);
      });
    } catch (e) {
      console.error('BoardService.deleteColumn -> taskService.deleteTask failed', e);
    }
  }
  addCard(columnIndex: number, cardTitle: string): void {
    if (!this.ensureActive() || !cardTitle?.trim()) return;
    const trimmedTitle = cardTitle.trim();

    const taskId =
      (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function')
        ? (crypto as any).randomUUID()
        : String(Date.now());

    const cols = this.columnsSubject.value.map((c, idx) =>
      idx === columnIndex
        ? {
          ...c,
          cards: [...c.cards, { title: trimmedTitle, status: 'To Do', assignee: '', description: '', taskId }],
          newCardName: '',
        }
        : c
    );

    this.columnsSubject.next(cols);
    this.persist(cols);

    const columnName = cols[columnIndex]?.title ?? 'Unknown';
    this.taskService.addTask({
      id: taskId,
      title: trimmedTitle,
      status: 'To Do',
      assignee: '',
      description: '',
      list: columnName,
      boardId: this.activeBoardId ?? undefined,
    });
  }

  updateCard(columnIndex: number, cardIndex: number, card: Card): void {
    if (!this.ensureActive()) return;

    const cols = this.columnsSubject.value.map((c, ci) => {
      if (ci !== columnIndex) return c;
      const cards = [...c.cards];
      if (cardIndex < 0 || cardIndex >= cards.length) return c;
      cards[cardIndex] = { ...card };
      return { ...c, cards };
    });

    this.columnsSubject.next(cols);
    this.persist(cols);
  }

  deleteCard(columnIndex: number, cardIndex: number): void {
    if (!this.ensureActive()) return;

    const existingCols = this.columnsSubject.value;
    const cardToRemove = existingCols[columnIndex]?.cards?.[cardIndex];
    // remove card first from board state
    const cols = existingCols.map((c, ci) =>
      ci === columnIndex ? { ...c, cards: c.cards.filter((_, idx) => idx !== cardIndex) } : { ...c, cards: [...c.cards] }
    );

    this.columnsSubject.next(cols);
    this.persist(cols);

    // then delete the linked task so All Tasks page also removes it
    try {
      const id = cardToRemove?.taskId;
      if (id) this.taskService.deleteTask(id);
    } catch (e) {
      console.error('BoardService.deleteCard -> taskService.deleteTask failed', e);
    }
  }

  deleteBoard(boardId: string): void {
    if (!boardId) return;
    try {
      // remove board from 'boards' list
      try {
        const raw = JSON.parse(localStorage.getItem('boards') ?? '[]');
        const boards = Array.isArray(raw) ? raw.filter((b: any) => String(b?.id) !== String(boardId)) : [];
        localStorage.setItem('boards', JSON.stringify(boards));
      } catch (e) {
        console.error('BoardService.deleteBoard -> failed to update boards list', e);
      }

      // remove per-board columns storage
      localStorage.removeItem(this.keyFor(boardId));

      // remove tasks associated with this board (direct typed call)
      try {
        // call the public method on TaskService so it's counted as used
        (this.taskService as any).deleteTasksByBoardId
          ? (this.taskService as any).deleteTasksByBoardId(boardId)
          : void 0;
      } catch (e) {
        console.error('BoardService.deleteBoard -> taskService.deleteTasksByBoardId failed', e);
      }

      console.debug('BoardService.deleteBoard -> removed board', boardId);
    } catch (e) {
      console.error('BoardService.deleteBoard failed', e);
    }
  }
  private loadFromStorage(boardId: string): Column[] {
    const key = this.keyFor(boardId);
    return this.safeParseColumns(localStorage.getItem(key)) ?? this.defaultColumns();
  }

  private persist(cols: Column[]): void {
    if (!this.activeBoardId) return;
    localStorage.setItem(this.keyFor(this.activeBoardId), JSON.stringify(cols));
  }

  private safeParseColumns(json: string | null): Column[] | null {
    if (!json) return null;
    try {
      const parsed = JSON.parse(json);
      return Array.isArray(parsed) ? (parsed as Column[]) : null;
    } catch {
      return null;
    }
  }

  private defaultColumns(): Column[] {
    return [
      { title: 'To Do', cards: [], newCardName: '' },
      { title: 'In Progress', cards: [], newCardName: '' },
      { title: 'Done', cards: [], newCardName: '' },
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
}
