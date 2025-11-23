// src/app/services/board/IBoardDataSource.ts
import { Observable } from 'rxjs';

export interface Card {
  id?: string;
  title: string;
  status?: string;
  assignee?: string;
  description?: string;
  position?: number;
}

export interface Column {
  id?: string;
  title: string;
  cards: Card[];
  newCardName?: string;
  position?: number;
}

export interface IBoardDataSource {
  /** Stream danh sách cột cho FE */
  readonly columns$: Observable<Column[]>;

  /** Gọi khi /card/:id được mở */
  setActiveBoardId(id: string): void;

  /** Nạp dữ liệu board từ API */
  loadBoard(id: string): Promise<void>;

  /** Column CRUD */
  addColumn(title: string): Promise<void>;
  deleteColumn(columnIndex: number): Promise<void>;

  /** Card CRUD */
  addCard(columnIndex: number, title: string): Promise<void>;
  updateCard(columnIndex: number, cardIndex: number, card: Card): Promise<void>;
  deleteCard(columnIndex: number, cardIndex: number): Promise<void>;
}
