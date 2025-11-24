import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf, NgStyle } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { UiFilterService } from '../../services/ui-filter/ui-filter.service';
import { Subscription } from 'rxjs';

import { ActivatedRoute } from '@angular/router';

import { Column, Card } from '../../services/board/IBoardDataSource';
import { ApiBoardDataSource } from '../../services/board/ApiBoardDataSource';
import { BoardService } from '../../services/board/board.service';
import { TaskService } from '../../services/task/task.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  standalone: true,
  imports: [FormsModule, NgForOf, NgIf, MatIconModule, NgStyle],
  styleUrls: ['./board.component.css'],
})
export class BoardComponent implements OnInit, OnDestroy {
  boardId = '';
  boardTitle = 'BẢNG CÔNG VIỆC';

  editingTitle = false;
  titleBuffer = '';

  currentFilterStatus: string | null = null;

  private filterSubscription!: Subscription;
  private boardSubscription!: Subscription;
  private routeSubscription!: Subscription;

  columns: Column[] = [];
  backgroundUrl = '';

  editing: { i: number; j: number } | null = null;
  editBuffer: Card = { title: '', status: 'To Do', assignee: '', description: '' };

  newColumnName = '';

  constructor(
    public uiFilterService: UiFilterService,
    private boardService: BoardService,
    private ds: ApiBoardDataSource,
    private taskService: TaskService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // Lắng nghe param /card/:id
    this.routeSubscription = this.route.paramMap.subscribe((pm) => {
      const id = pm.get('id') ?? '';
      this.applyBoardId(id);
    });

    // Filter UI
    this.filterSubscription = this.uiFilterService.currentFilterStatus$.subscribe(
      (status) => {
        this.currentFilterStatus = status;
      }
    );

    // Columns từ API datasource
    this.boardSubscription = this.boardService.columns$.subscribe((cols: Column[]) => {
      this.columns = cols;
    });

    this.ds.boardInfo$.subscribe(info => {
      if (!info) return;
      this.backgroundUrl = info.background ?? '';
    });
  }

  ngOnDestroy(): void {
    this.filterSubscription?.unsubscribe();
    this.boardSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
  }

  // ---------------- APPLY BOARD ID -------------------
  private applyBoardId(id: string) {
    if (!id || id === this.boardId) return;

    this.boardId = id;
    this.editing = null;
    this.editBuffer = { title: '', status: 'To Do', assignee: '', description: '' };

    // Ưu tiên navigation.state => từ Sidebar
    const stateTitle = (history.state?.board?.title as string | undefined)?.trim();
    this.boardTitle = stateTitle && stateTitle.length > 0 ? stateTitle : 'BẢNG CÔNG VIỆC';

    // Báo BoardService nạp dữ liệu backend
    this.boardService.setActiveBoardId(this.boardId);
  }

  // ---------------- TITLE EDIT -------------------
  startEditTitle(): void {
    this.titleBuffer = this.boardTitle ?? '';
    this.editingTitle = true;

    setTimeout(() => {
      const el = document.querySelector('.title-edit input') as HTMLInputElement | null;
      if (el) el.focus();
    }, 0);
  }

  saveTitle(): void {
    const newTitle = (this.titleBuffer ?? '').toString().trim();
    if (!newTitle) {
      this.cancelEditTitle();
      return;
    }

    this.boardTitle = newTitle;
    this.editingTitle = false;
    this.titleBuffer = '';

    try {
      const svcAny = this.boardService as any;
      if (typeof svcAny.setBoardTitle === 'function') {
        svcAny.setBoardTitle(this.boardId, newTitle);
      } else if (typeof svcAny.updateBoardTitle === 'function') {
        svcAny.updateBoardTitle(this.boardId, newTitle);
      }
    } catch {}

  }

  cancelEditTitle(): void {
    this.editingTitle = false;
    this.titleBuffer = '';
  }

  // ---------------- FILTER -------------------
  shouldHighlight(card: Card): boolean {
    if (!this.currentFilterStatus) return true;
    return (card.status || 'To Do') === this.currentFilterStatus;
  }

  // ---------------- CARD EDITOR -------------------
  openEditor(i: number, j: number, card: Card | string) {
    this.editing = { i, j };
    this.editBuffer =
      typeof card === 'string'
        ? { title: card, status: 'To Do', assignee: '', description: '' }
        : { ...card };
  }

  isEditing(i: number, j: number): boolean {
    return this.editing !== null && this.editing.i === i && this.editing.j === j;
  }

  save() {
    if (!this.editing) return;
    const { i, j } = this.editing;

    this.boardService.updateCard(i, j, { ...this.editBuffer });

    this.syncTaskFromEditBuffer();

    this.closeEditor();
  }

  deleteCard() {
    if (!this.editing) return;
    const { i, j } = this.editing;

    this.boardService.deleteCard(i, j);

    const maybeId = (this.editBuffer as any)?.id;
    if (maybeId) {
      try {
        this.taskService.deleteTask(maybeId);
      } catch (e) {
        console.error('deleteCard -> taskService.deleteTask failed', e);
      }
    }

    this.closeEditor();
  }

  closeEditor() {
    this.editing = null;
    this.editBuffer = { title: '', status: 'To Do', assignee: '', description: '' };
  }

  addCard(i: number) {
    const name = (this.columns[i] as any)?.newCardName?.trim();
    if (!name) return;

    this.boardService.addCard(i, name);

    if (this.columns[i]) (this.columns[i] as any).newCardName = '';
  }

  // ---------------- COLUMNS -------------------
  addColumn() {
    const name = this.newColumnName.trim();
    if (!name) return;
    this.boardService.addColumn(name);
    this.newColumnName = '';
  }

  deleteColumn(i: number) {
    if (
      this.columns.length > 1 &&
      confirm(`Bạn có chắc chắn muốn xóa cột "${(this.columns[i] as any).title}" không?`)
    ) {
      this.boardService.deleteColumn(i);
      if (this.editing && this.editing.i === i) this.closeEditor();
    }
  }

  // ---------------- SYNC TASK SERVICE -------------------
  private syncTaskFromEditBuffer(): void {
    if (!this.editBuffer) return;

    try {
      const buf: any = this.editBuffer;
      const status = (buf.status ?? 'To Do').toString();

      const partial: Partial<import('../../services/task/task.service').Task> = {
        status,
        title: buf.title ?? '',
        assignee: buf.assignee ?? '',
        description: buf.description ?? '',
        boardId: this.boardId || buf.boardId,
      };

      const snapshot = this.taskService.getSnapshot();
      let existing = undefined;

      if (buf.id) {
        existing = snapshot.find(t => t.id === buf.id);
      }

      if (!existing) {
        existing = snapshot.find(
          t =>
            String(t?.title).trim() === String(buf.title).trim() &&
            String(t?.boardId) === String(this.boardId)
        );
      }

      if (existing?.id) {
        partial.id = existing.id;
        partial.list = existing.list ?? buf.list ?? status;
      } else {
        partial.list = buf.list ?? status;
      }

      this.taskService.addTask(partial);
    } catch (e) {
      console.error('syncTaskFromEditBuffer failed', e);
    }
  }
}
