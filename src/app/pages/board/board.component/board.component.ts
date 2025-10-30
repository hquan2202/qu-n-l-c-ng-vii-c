import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
// @ts-ignore
import { MatIconModule } from '@angular/material/icon';
import { UiFilterService } from '../../../services/ui-filter/ui-filter.service'; // 🔥 IMPORT SERVICE
import { Subscription } from 'rxjs'; // Cần cho việc hủy đăng ký
// XÓA: import { FilterComponent } from '../../../components/filter/filter';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    MatIconModule,
    // 🔥 XÓA: FilterComponent
  ],
  styleUrls: ['./board.component.css'],
})
export class BoardComponent implements OnInit, OnDestroy {

  currentFilterStatus: string | null = null;
  private filterSubscription!: Subscription;

  columns: any[] = [
    { title: 'Cần làm', cards: [] },
    { title: 'Đang tiến hành', cards: [] },
    { title: 'Hoàn thành', cards: [] }
  ];

  editing: { i: number; j: number } | null = null;
  editBuffer: any = null;
  newColumnName: string = '';

  // 🔥 Inject Service vào constructor (cần public để dùng trong template)
  constructor(public uiFilterService: UiFilterService) {}

  ngOnInit(): void {
    // Theo dõi trạng thái lọc từ Service
    this.filterSubscription = this.uiFilterService.currentFilterStatus$.subscribe(status => {
      this.currentFilterStatus = status;
    });
  }

  ngOnDestroy(): void {
    this.filterSubscription.unsubscribe();
  }

  /**
   * Kiểm tra xem thẻ có nên được highlight (nổi lên) hay không.
   */
  shouldHighlight(card: any): boolean {
    if (!this.currentFilterStatus) {
      return true; // Nếu không có filter, tất cả đều nổi
    }
    // So sánh trạng thái của thẻ với trạng thái được chọn
    return (card.status || 'To Do') === this.currentFilterStatus;
  }

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

  addColumn() {
    const name = this.newColumnName.trim();
    if (!name) return;
    this.columns.push({ title: name, cards: [] });
    this.newColumnName = '';
  }

  deleteColumn(i: number) {
    if (this.columns.length > 1 && confirm(`Bạn có chắc chắn muốn xóa cột "${this.columns[i].title}" không? Tất cả thẻ sẽ bị mất.`)) {
      this.columns.splice(i, 1);
      if (this.editing && this.editing.i === i) {
        this.closeEditor();
      }
    }
  }
}
