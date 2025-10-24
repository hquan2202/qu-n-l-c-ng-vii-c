// file: src/app/pages/home/home.component.ts
import { Component } from '@angular/core';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { TaskDescriptionComponent } from '../../components/task-description/task-description';
import { CardComponent } from '../../components/card/card';

type Board = { title: string; color: string };

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

  openPopup(): void { this.showPopup = true; }
  closePopup(): void {
    this.showPopup = false;
    this.selectedBoard = undefined;
  }

  onCardClick(card: Board, index: number): void {
    if (this.normalizeTitle(card.title) === this.normalizeTitle(CREATE_TITLE)) {
      // open creation popup (no selectedBoard)
      this.selectedBoard = undefined;
      this.openPopup();
      return;
    }

    // navigate to board page (pass index as id). Optionally pass board via history state.
    this.router.navigate(['/board', index], { state: { board: card } });
  }

  addNewBoard(board?: { title?: string; color?: string; background?: string }): void {
    const title = board?.title?.trim();
    if (!title) return;

    const color = board?.color ?? board?.background ?? DEFAULT_COLOR;
    const newBoard: Board = { title, color };

    const createIndex = this.cards.findIndex(b => this.normalizeTitle(b.title) === this.normalizeTitle(CREATE_TITLE));
    if (createIndex >= 0) {
      this.cards.splice(createIndex, 0, newBoard);
    } else {
      this.cards.push(newBoard);
    }

    this.persist();
    this.showPopup = false;
  }

  deleteCard(index: number): void {
    if (index < 0 || index >= this.cards.length) return;
    const card = this.cards[index];
    if (!card || this.normalizeTitle(card.title) === this.normalizeTitle(CREATE_TITLE)) return;
    this.cards.splice(index, 1);
    this.persist();
  }

  private normalizeTitle(t?: string): string {
    return String(t ?? '').replace(/^\+?\s*/, '').trim();
  }

  private loadBoards(): Board[] {
    let raw: any = [];
    try {
      raw = JSON.parse(localStorage.getItem('boards') ?? '[]');
      if (!Array.isArray(raw)) raw = [];
    } catch {
      raw = [];
    }

    const boards: Board[] = raw
      .map((b: any) => ({
        title: String(b?.title ?? '').trim(),
        color: b?.color ?? b?.background ?? DEFAULT_COLOR
      }))
      .filter((b: Board) => b.title.length > 0 && this.normalizeTitle(b.title) !== this.normalizeTitle(CREATE_TITLE));

    boards.push({ title: CREATE_TITLE, color: CREATE_COLOR });

    try { localStorage.setItem('boards', JSON.stringify(boards)); } catch { /* ignore */ }
    return boards;
  }

  private persist(): void {
    try {
      const normalized: Board[] = this.cards
        .map(b => ({ title: String(b.title ?? '').trim(), color: b.color ?? DEFAULT_COLOR }))
        .filter(b => b.title.length > 0 && this.normalizeTitle(b.title) !== this.normalizeTitle(CREATE_TITLE));

      normalized.push({ title: CREATE_TITLE, color: CREATE_COLOR });
      localStorage.setItem('boards', JSON.stringify(normalized));
      this.cards = normalized.slice();
    } catch { /* ignore */ }
  }
}
