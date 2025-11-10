import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {NgIf, NgFor, NgStyle, NgClass} from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

type Board = {
  id: string;
  title: string;
  color?: string;
  background?: string; // có thể là màu hoặc URL ảnh (kể cả 'url(...)')
  tasks?: any[];
};

const STORAGE_KEY = 'boards';
const CREATE_TITLE = 'Tạo bảng mới';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, NgStyle, NgClass],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit, OnDestroy {
  isBoardsOpen = true;
  myBoards: Board[] = [];

  private onBoardsUpdatedBound = this.reload.bind(this);
  private onStorageBound = this.onStorageEvent.bind(this);

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.reload();
    window.addEventListener('boards:updated', this.onBoardsUpdatedBound as EventListener);
    window.addEventListener('storage', this.onStorageBound);
  }

  ngOnDestroy(): void {
    window.removeEventListener('boards:updated', this.onBoardsUpdatedBound as EventListener);
    window.removeEventListener('storage', this.onStorageBound);
  }

  toggleBoards(): void {
    this.isBoardsOpen = !this.isBoardsOpen;
  }

  private onStorageEvent(e: StorageEvent) {
    if (e.key === STORAGE_KEY) this.reload();
  }

  private reload() {
    const raw = this.safeParseArray(localStorage.getItem(STORAGE_KEY));
    // chỉ lấy boards thật, bỏ “Tạo bảng mới”
    const boards: Board[] = raw
      .map((b: any, i: number): Board => ({
        id: String(b?.id ?? `b_${Date.now()}_${i}`),
        title: String(b?.title ?? '').trim(),
        color: b?.color ?? '#333333',
        background: b?.background ?? b?.color ?? '#ffffff',
        tasks: Array.isArray(b?.tasks) ? b.tasks : [],
      }))
      .filter((b) => b.title && b.title !== CREATE_TITLE);

    this.myBoards = boards;
    this.cdr.markForCheck();
  }

  private safeParseArray(json: string | null): any[] {
    if (!json) return [];
    try {
      const parsed = JSON.parse(json);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  trackById(_: number, b: Board) {
    return b.id;
  }

  getInitial(title?: string): string {
    const t = (title ?? '').trim();
    return t ? t[0].toUpperCase() : 'B';
  }

  // Kiểm tra background là URL ảnh hoặc chuỗi 'url(...)'
  isImage(bg?: string): boolean {
    if (!bg) return false;
    const v = bg.trim().toLowerCase();
    return (
      v.startsWith('http://') ||
      v.startsWith('https://') ||
      v.startsWith('data:image') ||
      v.startsWith('url(') ||
      v.endsWith('.png') ||
      v.endsWith('.jpg') ||
      v.endsWith('.jpeg') ||
      v.endsWith('.webp') ||
      v.endsWith('.gif') ||
      v.endsWith('.svg')
    );
  }

  // Style cho thumbnail
  getThumbStyle(b: Board) {
    const bg = (b.background ?? '').trim();
    if (this.isImage(bg)) {
      // hỗ trợ cả dạng 'url(...)' và URL thô
      const url = bg.startsWith('url(') ? bg : `url("${bg}")`;
      return {
        'background-image': url,
        'background-size': 'cover',
        'background-position': 'center',
      };
    }
    // xem như màu
    return {
      'background': bg || (b.color ?? '#eee'),
    };
  }
}
