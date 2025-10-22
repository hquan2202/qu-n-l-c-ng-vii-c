// board.component.ts (Hoàn chỉnh)
import { Component, OnInit } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
// @ts-ignore
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    MatIconModule
  ],
  styleUrls: ['./board.component.css'],
})
export class BoardComponent implements OnInit {
  columns: any[] = [
    { title: 'To Do', cards: [] },
    { title: 'In Progress', cards: [] },
    { title: 'Done', cards: [] }
  ];

  editing: { i: number; j: number } | null = null;
  editBuffer: any = null;

  // Biến mới cho tính năng Thêm Cột
  newColumnName: string = '';

  ngOnInit(): void {}

  openEditor(i: number, j: number, card: any) {
    this.editing = { i, j };
    if (typeof card === 'string') {
      this.editBuffer = { title: card, status: 'To Do', assignee: '', description: '' };
    } else {
      this.editBuffer = { ...card };
    }
  }

  isEditing(i: number, j: number) {
    return this.editing !== null && this.editing.i === i && this.editing.j === j;
  }

  save() {
    if (!this.editing || !this.editBuffer) return;
    const { i, j } = this.editing;
    this.columns[i].cards[j] = { ...this.editBuffer };
    this.closeEditor();
  }

  // Hàm xóa thẻ
  deleteCard() {
    if (!this.editing) return;
    const { i, j } = this.editing;
    this.columns[i].cards.splice(j, 1);
    this.closeEditor();
  }

  closeEditor() {
    this.editing = null;
    this.editBuffer = null;
  }

  addCard(i: number) {
    const name = this.columns[i].newCardName;
    if (!name) return;
    this.columns[i].cards.push({ title: name, status: 'To Do', assignee: '', description: '' });
    this.columns[i].newCardName = '';
  }

  // Logic Thêm Cột
  addColumn() {
    const name = this.newColumnName.trim();
    if (!name) return;
    this.columns.push({ title: name, cards: [] });
    this.newColumnName = '';
  }

  // Logic Xóa Cột
  deleteColumn(i: number) {
    if (this.columns.length > 1 && confirm(`Bạn có chắc chắn muốn xóa cột "${this.columns[i].title}" không? Tất cả thẻ sẽ bị mất.`)) {
      this.columns.splice(i, 1);
      if (this.editing && this.editing.i === i) {
        this.closeEditor();
      }
    }
  }
}
