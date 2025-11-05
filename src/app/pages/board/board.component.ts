import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UiFilterService } from '../../services/ui-filter/ui-filter.service';
import { Subscription } from 'rxjs';
import { BoardService, Column, Card } from '../../services/board/board.service';
import { ActivatedRoute } from '@angular/router';

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
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // 🔁 Quan trọng: lắng nghe thay đổi param :id để reload khi click board khác
    this.routeSubscription = this.route.paramMap.subscribe((pm) => {
      const id = pm.get('id') ?? '';
      this.applyBoardId(id);
    });

    // giữ logic filter/columns
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

  // ========= CORE: đổi boardId thì cập nhật tiêu đề + nạp dữ liệu =========
  private applyBoardId(id: string) {
    if (!id || id === this.boardId) return;

    this.boardId = id;
    this.editing = null; // reset editor khi đổi bảng
    this.editBuffer = { title: '', status: 'To Do', assignee: '', description: '' };

    // 1) Ưu tiên title truyền qua navigation state
    const stateTitle = (history.state?.board?.title as string | undefined)?.trim();
    if (stateTitle) {
      this.boardTitle = stateTitle;
    } else {
      // 2) Fallback đọc từ localStorage('boards')
      try {
        const raw = JSON.parse(localStorage.getItem('boards') ?? '[]') as Array<{ id?: string; title?: string }>;
        const found = Array.isArray(raw) ? raw.find((b) => String(b?.id) === String(this.boardId)) : undefined;
        this.boardTitle = (found?.title ?? 'BẢNG CÔNG VIỆC').toString().trim() || 'BẢNG CÔNG VIỆC';
      } catch {
        this.boardTitle = 'BẢNG CÔNG VIỆC';
      }
    }

    // 3) Báo cho BoardService nạp dữ liệu theo boardId (nếu service có API); fallback an toàn
    // Ưu tiên các hàm nếu chúng tồn tại trong service của bạn.
    try {
      // ví dụ các tên hàm khả dụng tuỳ dự án của bạn:
      if (typeof (this.boardService as any).setActiveBoardId === 'function') {
        (this.boardService as any).setActiveBoardId(this.boardId);
      } else if (typeof (this.boardService as any).loadBoard === 'function') {
        (this.boardService as any).loadBoard(this.boardId);
      } else if (typeof (this.boardService as any).initBoardIfMissing === 'function') {
        (this.boardService as any).initBoardIfMissing(this.boardId);
      }
      // nếu không có hàm nào, columns$ vẫn sẽ giữ giá trị cũ; bạn có thể
      // bổ sung một API trong BoardService để lấy/nạp cột theo boardId.
    } catch {
      // bỏ qua nếu service không hỗ trợ
    }
  }

  shouldHighlight(card: Card | any): boolean {
    if (!this.currentFilterStatus) return true;
    return (card.status || 'To Do') === this.currentFilterStatus;
    // lưu ý: nếu status bọc qua service, đảm bảo update đi qua service để push columns$
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
    if (
      this.columns.length > 1 &&
      confirm(`Bạn có chắc chắn muốn xóa cột "${this.columns[i].title}" không? Tất cả thẻ sẽ bị mất.`)
    ) {
      this.boardService.deleteColumn(i);
      if (this.editing && this.editing.i === i) this.closeEditor();
    }
  }

  toggleComplete(card: Card | any) {
    card.status = card.status === 'Done' ? 'To Do' : 'Done';
  }
}
