// src/app/services/board/board.service.ts
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BOARD_DATASOURCE } from './BOARD_DATASOURCE';
import { IBoardDataSource, Card, Column } from './IBoardDataSource';

export interface Board {
  id: string;
  title: string;
  background: string;
  color?: string;
  type?: 'personal' | 'workspace';
  columns?: Column[];
}

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  /** Columns observable cho BoardComponent */
  columns$: Observable<Column[]>;

  constructor(@Inject(BOARD_DATASOURCE) private ds: IBoardDataSource) {
    this.columns$ = this.ds.columns$;
  }

  /** Set board đang active */
  setActiveBoardId(id: string) {
    return this.ds.setActiveBoardId(id);
  }

  /** Load board (nếu datasource hỗ trợ explicit load) */
  loadBoard(id: string) {
    return this.ds.loadBoard(id);
  }

  // ======================= COLUMN =======================

  addColumn(title: string) {
    return this.ds.addColumn(title);
  }

  deleteColumn(i: number) {
    return this.ds.deleteColumn(i);
  }

  // ======================= CARD =======================

  addCard(i: number, title: string) {
    return this.ds.addCard(i, title);
  }

  updateCard(i: number, j: number, card: Card) {
    return this.ds.updateCard(i, j, card);
  }

  deleteCard(i: number, j: number) {
    return this.ds.deleteCard(i, j);
  }
}
