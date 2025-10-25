import { Component } from '@angular/core';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { TaskDescriptionComponent } from '../../components/task-description/task-description';
import { CardComponent } from '../../components/card/card';

type Board = {
  id?: string;
  title: string;
  color: string;
  background?: string;
  tasks?: any[];
};

const DEFAULT_COLOR = '#e6f7ff';
const CREATE_COLOR = '#ffffff';
const CREATE_TITLE = 'Tạo bảng mới';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, TaskDescriptionComponent, CardComponent, NgClass],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  showPopup = false;
  selectedBoard?: Board;
  cards: Board[] = [];

  constructor(private router: Router) {
    this.cards = this.loadBoards();
  }

  // --- Popup ---
  openPopup(): void { this.showPopup = true; }
  closePopup(): void {
    this.showPopup = false;
    this.selectedBoard = undefined;
  }

  // --- Xử lý click card ---
  onCardClick(card: Board, index: number): void {
    if (this.normalizeTitle(card.title) === CREATE_TITLE) {
      this.selectedBoard = undefined;
      this.openPopup();
      return;
    }
    this.router.navigate(['/board', index], { state: { board: card } });
  }

  // --- Thêm card mới ---
  addNewBoard(board?: { title?: string; color?: string; background?: string }): void {
    if (!board?.title) return;

    const newBoard: Board = {
      id: `${Date.now()}`,
      title: board.title,
      color: board.color ?? '#333333',
      background: board.background ?? '#ffffff'
    };

    const createIndex = this.cards.findIndex(c => this.normalizeTitle(c.title) === CREATE_TITLE);
    if (createIndex >= 0) this.cards.splice(createIndex, 0, newBoard);
    else this.cards.push(newBoard);

    this.persist();
    this.showPopup = false;
  }

  // --- Xóa từng card ---
  deleteCard(index: number): void {
    if (index < 0 || index >= this.cards.length) return;
    const card = this.cards[index];
    if (!card || this.normalizeTitle(card.title) === CREATE_TITLE) return;
    this.cards.splice(index, 1);
    this.persist();
  }

  // --- Xóa tất cả card do người dùng tạo ---
  clearAllCards(): void {
    if (!confirm('Bạn có chắc chắn muốn xóa tất cả card không?')) return;
    this.cards = this.cards.filter(c => this.normalizeTitle(c.title) === CREATE_TITLE);
    this.persist();
  }

  // --- Helpers ---
  normalizeTitle(t?: string): string {   // public để template gọi được
    return String(t ?? '').replace(/^\+?\s*/, '').trim();
  }

  private loadBoards(): Board[] {
    let raw: any[] = [];
    try {
      raw = JSON.parse(localStorage.getItem('boards') ?? '[]');
      if (!Array.isArray(raw)) raw = [];
    } catch {
      raw = [];
    }

    const boards: Board[] = raw
      .map((b: any, i: number): Board => ({
        id: b?.id ?? `${Date.now()}-${i}-${Math.random().toString(36).slice(2,6)}`,
        title: String(b?.title ?? '').trim(),
        background: String(b?.background ?? b?.color ?? DEFAULT_COLOR),
        color: String(b?.color ?? b?.background ?? DEFAULT_COLOR),
        tasks: Array.isArray(b?.tasks) ? b.tasks : []
      }))
      .filter((b: Board) => b.title.length > 0 && this.normalizeTitle(b.title) !== CREATE_TITLE);

    // luôn thêm nút tạo bảng mới
    boards.push({ id: `${Date.now()}-create`, title: CREATE_TITLE, color: CREATE_COLOR, background: CREATE_COLOR });

    try { localStorage.setItem('boards', JSON.stringify(boards)); } catch {}
    return boards;
  }

  private persist(): void {
    try {
      const normalized: Board[] = this.cards
        .map((b: Board): Board => ({
          id: b.id ?? `${Date.now()}-${Math.random().toString(36).slice(2,9)}`,
          title: String(b.title ?? '').trim(),
          background: b.background ?? b.color ?? DEFAULT_COLOR,
          color: b.color ?? b.background ?? DEFAULT_COLOR,
          tasks: Array.isArray(b.tasks) ? b.tasks : []
        }))
        .filter((b: Board) => b.title.length > 0 && this.normalizeTitle(b.title) !== CREATE_TITLE);

      normalized.push({ id: `${Date.now()}-create`, title: CREATE_TITLE, color: CREATE_COLOR, background: CREATE_COLOR });

      localStorage.setItem('boards', JSON.stringify(normalized));
      this.cards = normalized.slice();
    } catch (e) {
      console.error('Persist boards error:', e);
    }
  }

  protected readonly CREATE_TITLE = CREATE_TITLE;
}
