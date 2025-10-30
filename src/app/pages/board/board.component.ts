import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
// @ts-ignore
import { MatIconModule } from '@angular/material/icon';
import { UiFilterService } from '../../services/ui-filter/ui-filter.service';
import { Subscription } from 'rxjs';
import { BoardService, Column, Card } from '../../services/board/board.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    MatIconModule,
  ],
  styleUrls: ['./board.component.css'],
})
export class BoardComponent implements OnInit, OnDestroy {
  currentFilterStatus: string | null = null;
  private filterSubscription!: Subscription;
  private boardSubscription!: Subscription;

  columns: Column[] = [];
  editing: { i: number; j: number } | null = null;
  editBuffer: Card = { title: '', status: 'To Do', assignee: '', description: '' };
  newColumnName: string = '';

  constructor(
    public uiFilterService: UiFilterService,
    private boardService: BoardService
  ) {}

  ngOnInit(): void {
    this.filterSubscription = this.uiFilterService.currentFilterStatus$.subscribe(status => {
      this.currentFilterStatus = status;
    });

    this.boardSubscription = this.boardService.columns$.subscribe((cols: Column[]) => {
      this.columns = cols;
    });
  }

  ngOnDestroy(): void {
    this.filterSubscription?.unsubscribe();
    this.boardSubscription?.unsubscribe();
  }

  shouldHighlight(card: Card | any): boolean {
    if (!this.currentFilterStatus) return true;
    return (card.status || 'To Do') === this.currentFilterStatus;
  }

  openEditor(i: number, j: number, card: Card | string) {
    this.editing = { i, j };
    if (typeof card === 'string') {
      this.editBuffer = { title: card, status: 'To Do', assignee: '', description: '' };
    } else {
      this.editBuffer = { ...card };
    }
  }

  isEditing(i: number, j: number): boolean {
    return this.editing !== null && this.editing.i === i && this.editing.j === j;
  }

  save() {
    if (!this.editing) return;
    const { i, j } = this.editing;
    this.boardService.updateCard(i, j, { ...this.editBuffer });
    this.closeEditor();
  }

  deleteCard() {
    if (!this.editing) return;
    const { i, j } = this.editing;
    this.boardService.deleteCard(i, j);
    this.closeEditor();
  }

  closeEditor() {
    this.editing = null;
    this.editBuffer = { title: '', status: 'To Do', assignee: '', description: '' };
  }

  addCard(i: number) {
    const name = this.columns[i]?.newCardName;
    if (!name) return;
    this.boardService.addCard(i, name);
    if (this.columns[i]) this.columns[i].newCardName = '';
  }

  addColumn() {
    const name = this.newColumnName.trim();
    if (!name) return;
    this.boardService.addColumn(name);
    this.newColumnName = '';
  }

  deleteColumn(i: number) {
    if (this.columns.length > 1 && confirm(`Bạn có chắc chắn muốn xóa cột "${this.columns[i].title}" không? Tất cả thẻ sẽ bị mất.`)) {
      this.boardService.deleteColumn(i);
      if (this.editing && this.editing.i === i) {
        this.closeEditor();
      }
    }
  }

  toggleComplete(card: Card | any) {
    card.status = card.status === 'Done' ? 'To Do' : 'Done';
  }
}
