// typescript
import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {UiFilterService} from '../../services/ui-filter/ui-filter.service';
import {BoardService, Card, Column} from '../../services/board/board.service';
import {ActivatedRoute} from '@angular/router';
import {TaskService} from '../../services/task/task.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  standalone: true,
  imports: [FormsModule, NgForOf, NgIf, MatIconModule],
  styleUrls: ['./board.component.css'],
})
export class BoardComponent implements OnInit, OnDestroy {
  boardId = '';
  boardTitle = 'BẢNG CÔNG VIỆC';

  // title edit state
  editingTitle = false;
  titleBuffer = '';

  currentFilterStatus: string | null = null;
  private filterSubscription!: Subscription;
  private boardSubscription!: Subscription;
  private routeSubscription!: Subscription;

  columns: Column[] = [];
  editing: { i: number; j: number } | null = null;
  editBuffer: Card = { title: '', status: 'To Do', assignee: '', description: '' };
  newColumnName = '';

  constructor(
    public uiFilterService: UiFilterService,
    private boardService: BoardService,
    private route: ActivatedRoute,
    private taskService: TaskService,
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((pm) => {
      const id = pm.get('id') ?? '';
      this.applyBoardId(id);
    });

    this.filterSubscription = this.uiFilterService.currentFilterStatus$.subscribe((status) => {
      this.currentFilterStatus = status;
    });

    this.boardSubscription = this.boardService.columns$.subscribe((cols: Column[]) => {
      this.columns = cols;
    });
  }

  ngOnDestroy(): void {
    this.filterSubscription?.unsubscribe();
    this.boardSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
  }

  private applyBoardId(id: string) {
    if (!id || id === this.boardId) return;

    this.boardId = id;
    this.editing = null;
    this.editBuffer = { title: '', status: 'To Do', assignee: '', description: '' };

    const stateTitle = (history.state?.board?.title as string | undefined)?.trim();
    if (stateTitle) {
      this.boardTitle = stateTitle;
    } else {
      try {
        const raw = JSON.parse(localStorage.getItem('boards') ?? '[]') as Array<{ id?: string; title?: string }>;
        const found = Array.isArray(raw) ? raw.find((b) => String(b?.id) === String(this.boardId)) : undefined;
        this.boardTitle = (found?.title ?? 'BẢNG CÔNG VIỆC').toString().trim() || 'BẢNG CÔNG VIỆC';
      } catch {
        this.boardTitle = 'BẢNG CÔNG VIỆC';
      }
    }

    try {
      const svcAny = this.boardService as any;
      if (typeof svcAny.setActiveBoardId === 'function') {
        svcAny.setActiveBoardId(this.boardId);
      } else if (typeof svcAny.loadBoard === 'function') {
        svcAny.loadBoard(this.boardId);
      } else if (typeof svcAny.initBoardIfMissing === 'function') {
        svcAny.initBoardIfMissing(this.boardId);
      }
    } catch {
      // ignore
    }
  }

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
      const raw = JSON.parse(localStorage.getItem('boards') ?? '[]');
      if (Array.isArray(raw)) {
        const idx = raw.findIndex((b: any) => String(b?.id) === String(this.boardId));
        if (idx >= 0) {
          raw[idx].title = newTitle;
          localStorage.setItem('boards', JSON.stringify(raw));
        }
      }
    } catch (e) {
      console.error('BoardComponent.saveTitle -> persist failed', e);
    }

    try {
      const svcAny = this.boardService as any;
      if (typeof svcAny.setBoardTitle === 'function') {
        svcAny.setBoardTitle(this.boardId, newTitle);
      } else if (typeof svcAny.updateBoardTitle === 'function') {
        svcAny.updateBoardTitle(this.boardId, newTitle);
      }
    } catch {
      // ignore
    }
  }

  cancelEditTitle(): void {
    this.editingTitle = false;
    this.titleBuffer = '';
  }

  shouldHighlight(card: Card | any): boolean {
    if (!this.currentFilterStatus) return true;
    return (card.status || 'To Do') === this.currentFilterStatus;
  }

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

    // do not modify editBuffer.list here — keep the card's list unchanged when status changes
    this.boardService.updateCard(i, j, { ...this.editBuffer });

    // sync to TaskService so AllTask reflects the change (but preserve existing task.list)
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
        console.error('BoardComponent.deleteCard -> taskService.deleteTask failed', e);
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

    try {
      this.boardService.addCard(i, name);
    } catch (e) {
      console.error('BoardComponent.addCard -> boardService.addCard failed', e);
    }

    if (this.columns[i]) (this.columns[i] as any).newCardName = '';
  }

  addColumn() {
    const name = this.newColumnName.trim();
    if (!name) return;
    this.boardService.addColumn(name);
    this.newColumnName = '';
  }

  deleteColumn(i: number) {
    if (
      this.columns.length > 1 &&
      confirm(`Bạn có chắc chắn muốn xóa cột "${(this.columns[i] as any).title}" không? Tất cả thẻ sẽ bị mất.`)
    ) {
      this.boardService.deleteColumn(i);
      if (this.editing && this.editing.i === i) this.closeEditor();
    }
  }

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

      // look up existing task (by id first, then by title+boardId)
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
        // update existing: keep its current list if present
        partial.id = existing.id;
        partial.list = existing.list ?? buf.list ?? status;
      } else {
        // new task: use provided list or fall back to status
        partial.list = buf.list ?? status;
      }

      this.taskService.addTask(partial);
    } catch (e) {
      console.error('BoardComponent.syncTaskFromEditBuffer -> taskService.addTask failed', e);
    }
  }

}
