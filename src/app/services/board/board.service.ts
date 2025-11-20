import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TaskService } from '../task/task.service';

// --- INTERFACES ---
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

export interface Board {
  id: string;
  title: string;
  background: string;
  color?: string;
  type: 'personal' | 'workspace';
  columns: Column[];
}

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private readonly STORAGE_KEY = 'boards_db_temp';

  // 🟢 SỬA Ở ĐÂY: Để mảng rỗng để app bắt đầu sạch sẽ
  private initialBoards: Board[] = [];

  // State
  private boardsSubject = new BehaviorSubject<Board[]>([]);
  public readonly boards$ = this.boardsSubject.asObservable();

  private columnsSubject = new BehaviorSubject<Column[]>([]);
  public readonly columns$ = this.columnsSubject.asObservable();

  private activeBoardId: string | null = null;

  constructor(private taskService: TaskService) {
    this.loadFromStorage();
  }

  // --- HELPER: STORAGE ---
  private saveToStorage(boards: Board[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(boards));
  }

  private loadFromStorage() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      this.boardsSubject.next(JSON.parse(data));
    } else {
      // Nếu chưa có dữ liệu thì dùng mảng rỗng ban đầu
      this.boardsSubject.next(this.initialBoards);
    }
  }

  // --- LOGIC BOARD ---

  loadBoard(id: string): void {
    this.setActiveBoardId(id);
  }

  setActiveBoardId(id: string): void {
    this.activeBoardId = id;
    const board = this.boardsSubject.value.find(b => b.id === id);
    if (board) {
      // Load columns của bảng đó
      this.columnsSubject.next(board.columns || []);
    } else {
      this.columnsSubject.next([]);
    }
  }

  getBoardsValue(): Board[] {
    return this.boardsSubject.value;
  }

  addBoard(newBoard: Board) {
    // 🟢 QUAN TRỌNG: Tự động thêm cột mặc định nếu bảng mới chưa có
    if (!newBoard.columns || newBoard.columns.length === 0) {
      newBoard.columns = this.defaultColumns();
    }

    const currentBoards = this.boardsSubject.value;
    const newBoardsList = [...currentBoards, newBoard];

    this.boardsSubject.next(newBoardsList);
    this.saveToStorage(newBoardsList);
  }

  deleteBoard(boardId: string) {
    const currentBoards = this.boardsSubject.value;
    const updatedBoards = currentBoards.filter(b => b.id !== boardId);

    this.boardsSubject.next(updatedBoards);
    this.saveToStorage(updatedBoards);

    if (this.activeBoardId === boardId) {
      this.columnsSubject.next([]);
      this.activeBoardId = null;
    }
  }

  // --- LOGIC COLUMN & CARD ---

  private updateActiveBoardState(newColumns: Column[]) {
    if (!this.activeBoardId) return;
    this.columnsSubject.next(newColumns);

    const allBoards = this.boardsSubject.value;
    const boardIndex = allBoards.findIndex(b => b.id === this.activeBoardId);

    if (boardIndex !== -1) {
      const updatedBoard = { ...allBoards[boardIndex], columns: newColumns };
      const newAllBoards = [...allBoards];
      newAllBoards[boardIndex] = updatedBoard;

      this.boardsSubject.next(newAllBoards);
      this.saveToStorage(newAllBoards);
    }
  }

  addColumn(title: string): void {
    if (!this.ensureActive() || !title?.trim()) return;
    const newCols = [...this.columnsSubject.value, { title: title.trim(), cards: [], newCardName: '' }];
    this.updateActiveBoardState(newCols);
  }

  deleteColumn(index: number): void {
    if (!this.ensureActive()) return;
    const cols = [...this.columnsSubject.value];
    if (index < 0 || index >= cols.length) return;

    const taskIds = (cols[index]?.cards ?? []).map(c => c.taskId).filter(Boolean) as string[];
    taskIds.forEach(id => { if(id) this.taskService.deleteTask(id); });

    cols.splice(index, 1);
    this.updateActiveBoardState(cols);
  }

  addCard(columnIndex: number, cardTitle: string): void {
    if (!this.ensureActive() || !cardTitle?.trim()) return;
    const trimmedTitle = cardTitle.trim();
    const taskId = this.generateId();
    const currentCols = this.columnsSubject.value;

    const newCols = currentCols.map((c, idx) =>
      idx === columnIndex
        ? { ...c, cards: [...c.cards, { title: trimmedTitle, status: 'To Do', assignee: '', taskId }], newCardName: '' }
        : c
    );
    this.updateActiveBoardState(newCols);

    const colName = currentCols[columnIndex]?.title || 'Unknown';
    this.taskService.addTask({ id: taskId, title: trimmedTitle, status: 'To Do', list: colName, boardId: this.activeBoardId || undefined });
  }

  updateCard(columnIndex: number, cardIndex: number, card: Card): void {
    if (!this.ensureActive()) return;
    const cols = this.columnsSubject.value.map((c, ci) => {
      if (ci !== columnIndex) return c;
      const cards = [...c.cards];
      if (cardIndex >= 0 && cardIndex < cards.length) cards[cardIndex] = { ...card };
      return { ...c, cards };
    });
    this.updateActiveBoardState(cols);
  }

  deleteCard(columnIndex: number, cardIndex: number): void {
    if (!this.ensureActive()) return;
    const currentCols = this.columnsSubject.value;
    const cardToRemove = currentCols[columnIndex]?.cards?.[cardIndex];

    const newCols = currentCols.map((c, ci) =>
      ci === columnIndex
        ? { ...c, cards: c.cards.filter((_, idx) => idx !== cardIndex) }
        : c
    );
    this.updateActiveBoardState(newCols);
    if (cardToRemove?.taskId) this.taskService.deleteTask(cardToRemove.taskId);
  }

  // 🟢 HÀM NÀY QUAN TRỌNG: Tạo cấu trúc cột mặc định cho bảng mới
  private defaultColumns(): Column[] {
    return [
      { title: 'To Do', cards: [] },
      { title: 'In Progress', cards: [] },
      { title: 'Done', cards: [] }
    ];
  }

  private ensureActive(): boolean {
    return !!this.activeBoardId;
  }

  private generateId(): string {
    return (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') ? crypto.randomUUID() : String(Date.now());
  }
}
