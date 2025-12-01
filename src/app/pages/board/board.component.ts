// src/app/pages/board/board.component.ts

import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Thay cho JsonPipe, NgForOf, NgIf
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

// Services
import { UiFilterService } from '../../services/ui-filter/ui-filter.service';
import { BoardService } from '../../services/board/board.service';
import { TaskService } from '../../services/task/task.service';
import { Column, Card } from '../../services/board/IBoardDataSource';

// Components
import { ShareComponent } from '../../components/share/share'; // 👈 Import Share Component

// Types
type BoardMember = {
  user_id: string;
  role: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  imageError?: boolean; // Để xử lý khi ảnh avatar bị lỗi
};

@Component({
  selector: 'app-board',
  standalone: true,
  // 👇 Đã thêm ShareComponent và CommonModule vào đây
  imports: [CommonModule, FormsModule, MatIconModule, ShareComponent],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
})
export class BoardComponent implements OnInit, OnDestroy {
  // --- BOARD STATE ---
  boardId = '';
  boardTitle = 'BẢNG CÔNG VIỆC';
  backgroundUrl = '';
  columns: Column[] = [];

  // --- EDIT TITLE STATE ---
  editingTitle = false;
  titleBuffer = '';

  // --- MEMBERS STATE ---
  boardMembers: BoardMember[] = [];
  readonly MAX_INLINE_MEMBERS = 3;

  // --- FILTER STATE ---
  currentFilterStatus: string | null = null;

  // --- EDIT CARD STATE ---
  editing: { i: number; j: number } | null = null;
  editBuffer: Card = {
    title: '',
    status: 'To Do',
    assignee: '',
    description: '',
  };
  newColumnName = '';

  // --- POPUP SHARE STATE ---
  showSharePopup = false; // Biến bật/tắt popup share

  // --- SUBSCRIPTIONS ---
  private subs: Subscription[] = [];

  constructor(
    public uiFilterService: UiFilterService,
    private boardService: BoardService, // Chỉ dùng BoardService, không dùng ApiBoardDataSource trực tiếp
    private taskService: TaskService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef, // Để ép cập nhật UI
  ) {}

  // =====================================================
  // LIFECYCLE
  // =====================================================
  ngOnInit(): void {
    // 1️⃣ Lắng nghe URL (/board/:id)
    const routeSub = this.route.paramMap.subscribe((pm) => {
      const id = pm.get('id') ?? '';
      this.applyBoardId(id);
    });
    this.subs.push(routeSub);

    // 2️⃣ Lắng nghe Filter (To Do / Doing / Done)
    const filterSub = this.uiFilterService.currentFilterStatus$.subscribe((status) => {
      this.currentFilterStatus = status;
    });
    this.subs.push(filterSub);

    // 3️⃣ Lắng nghe Columns (Dữ liệu chính)
    const colSub = this.boardService.columns$.subscribe((cols: Column[]) => {
      this.columns = cols;
      this.cdr.detectChanges(); // Cập nhật UI khi cột thay đổi
    });
    this.subs.push(colSub);

    // 4️⃣ Lắng nghe Board Info (Title, Background, Members)
    // Lưu ý: boardInfo$ được expose từ BoardService (như đã sửa ở các bước trước)
    const infoSub = this.boardService.boardInfo$.subscribe((info: any) => {
      if (!info) return;

      // Background
      this.backgroundUrl = info.background ?? '';

      // Title
      if (!this.editingTitle && info.name) {
        this.boardTitle = info.name;
      }

      // Members
      const rawMembers = info.members || [];
      this.boardMembers = [...rawMembers]; // Clone mảng để trigger change detection

      // 🔥 Ép giao diện vẽ lại ngay lập tức
      this.cdr.detectChanges();
    });
    this.subs.push(infoSub);

    // 5️⃣ Lắng nghe sự kiện bấm nút Share từ Navbar
    const shareSub = this.boardService.shareClick$.subscribe(() => {
      console.log('⚡ Board: Mở popup Share');
      this.showSharePopup = true;
      this.cdr.detectChanges();
    });
    this.subs.push(shareSub);
  }

  ngOnDestroy(): void {
    // Hủy tất cả subscription để tránh memory leak
    this.subs.forEach((s) => s.unsubscribe());
  }

  // =====================================================
  // LOGIC SHARE POPUP
  // =====================================================
  closeSharePopup() {
    this.showSharePopup = false;
  }

  // =====================================================
  // BOARD ID HANDLING
  // =====================================================
  private applyBoardId(id: string) {
    if (!id || id === this.boardId) return;

    this.boardId = id;
    this.closeEditor(); // Đóng editor nếu đang mở ở board cũ

    // Ưu tiên title từ history state (trải nghiệm mượt hơn)
    const stateTitle = (history.state?.board?.title as string | undefined)?.trim();
    if (stateTitle) {
      this.boardTitle = stateTitle;
    }

    // Gọi API load dữ liệu
    this.boardService.setActiveBoardId(this.boardId);
  }

  // =====================================================
  // TITLE EDIT
  // =====================================================
  startEditTitle(): void {
    this.titleBuffer = this.boardTitle ?? '';
    this.editingTitle = true;
    setTimeout(() => {
      const el = document.querySelector('.title-edit input') as HTMLInputElement | null;
      if (el) el.focus();
    }, 0);
  }

  saveTitle(): void {
    const newTitle = (this.titleBuffer ?? '').trim();
    if (!newTitle) {
      this.cancelEditTitle();
      return;
    }

    this.boardTitle = newTitle;
    this.editingTitle = false;

    // Gọi Service cập nhật Title (Cần cast any nếu interface chưa update)
    const svc: any = this.boardService;
    if (typeof svc.setBoardTitle === 'function') {
      svc.setBoardTitle(this.boardId, newTitle);
    } else if (typeof svc.updateBoardTitle === 'function') {
      svc.updateBoardTitle(this.boardId, newTitle);
    }
  }

  cancelEditTitle(): void {
    this.editingTitle = false;
  }

  // =====================================================
  // MEMBERS UI HELPERS
  // =====================================================
  get inlineMembers(): BoardMember[] {
    return this.boardMembers.slice(0, this.MAX_INLINE_MEMBERS);
  }

  get extraMembersCount(): number {
    return Math.max(0, this.boardMembers.length - this.MAX_INLINE_MEMBERS);
  }

  getInitials(value?: string | null): string {
    if (!value) return '?';
    const text = value.trim();
    const emailIdx = text.indexOf('@');
    const base = emailIdx > 0 ? text.slice(0, emailIdx) : text;
    const parts = base.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  showAllMembers(): void {
    if (!this.boardMembers.length) return;
    const list = this.boardMembers
      .map((m) => `${m.full_name || m.email} (${m.role})`)
      .join('\n');
    alert(`Members:\n${list}`);
  }

  // =====================================================
  // COLUMNS & CARDS CRUD
  // =====================================================
  addColumn() {
    const name = this.newColumnName.trim();
    if (!name) return;
    this.boardService.addColumn(name);
    this.newColumnName = '';
  }

  deleteColumn(i: number) {
    if (this.columns.length > 1 && confirm('Xóa danh sách này?')) {
      this.boardService.deleteColumn(i);
    }
  }

  addCard(i: number) {
    const col: any = this.columns[i];
    const name = col?.newCardName?.trim();
    if (!name) return;
    this.boardService.addCard(i, name);
    col.newCardName = '';
  }

  // =====================================================
  // CARD EDITOR & FILTER
  // =====================================================
  shouldHighlight(card: Card): boolean {
    if (!this.currentFilterStatus) return true;
    return (card.status || 'To Do') === this.currentFilterStatus;
  }

  openEditor(i: number, j: number, card: Card | string) {
    this.editing = { i, j };
    this.editBuffer = typeof card === 'string'
      ? { title: card, status: 'To Do', assignee: '', description: '' }
      : { ...card };
  }

  save() {
    if (!this.editing) return;
    const { i, j } = this.editing;
    this.boardService.updateCard(i, j, { ...this.editBuffer });
    this.syncTaskService(); // Sync sang TaskService (nếu cần)
    this.closeEditor();
  }

  deleteCard() {
    if (!this.editing) return;
    const { i, j } = this.editing;
    this.boardService.deleteCard(i, j);

    // Xóa bên TaskService nếu có ID
    const cardId = (this.editBuffer as any)?.id;
    if (cardId) {
      try { this.taskService.deleteTask(cardId); } catch {}
    }
    this.closeEditor();
  }

  closeEditor() {
    this.editing = null;
    this.editBuffer = { title: '', status: 'To Do', assignee: '', description: '' };
  }

  private syncTaskService() {
    // Logic sync sang TaskService để cập nhật My Tasks (Optional)
    // Giữ nguyên logic cũ của bạn ở đây nếu cần thiết
  }
}
