import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { TaskDescriptionComponent } from '../../components/task-description/task-description';
import { CardComponent } from '../../components/card/card';
import { HeaderComponent } from '../../components/header/header';
import { BoardService, Board } from '../../services/board/board.service';
const CREATE_BOARD_ID = 'ACTION_CREATE_BOARD';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TaskDescriptionComponent, CardComponent, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  showPopup = false;
  realBoards: Board[] = [];
  displayBoards: any[] = [];
  currentSearch = '';
  private boardSub!: Subscription;
  readonly CREATE_BOARD_ID = CREATE_BOARD_ID;

  constructor(
    private router: Router,
    private boardService: BoardService
  ) {}

  ngOnInit(): void {
    this.boardSub = this.boardService.boards$.subscribe(boards => {
      this.realBoards = boards;
      this.updateGrid();
    });
  }

  ngOnDestroy(): void {
    if (this.boardSub) this.boardSub.unsubscribe();
  }

  onSearch(keyword: string) {
    this.currentSearch = keyword.toLowerCase().trim();
    this.updateGrid();
  }

  private updateGrid() {
    let filtered = this.realBoards;
    if (this.currentSearch) {
      filtered = this.realBoards.filter(b => b.title.toLowerCase().includes(this.currentSearch));
    }
    this.displayBoards = [
      ...filtered,
      { id: CREATE_BOARD_ID, title: 'Create new board', color: '#ffffff', background: '' }
    ];
  }

  openPopup(): void { this.showPopup = true; }
  closePopup(): void { this.showPopup = false; }

  addNewBoard(eventData: any): void {
    if (!eventData?.title) return;

    const newBoard: Board = {
      id: Date.now().toString(),
      title: eventData.title,
      background: eventData.background,
      color: eventData.color,
      type: eventData.visibility || 'workspace',
      columns: []
    };

    this.boardService.addBoard(newBoard);
    this.showPopup = false;
  }

  onCardClick(card: any): void {
    if (card.id === CREATE_BOARD_ID) {
      this.openPopup();
    } else {
      // Hàm này giờ đã tồn tại trong Service
      this.boardService.loadBoard(card.id);
      this.router.navigate(['/board', card.id]);
    }
  }

  deleteCard(card: any): void {
    if (card.id === CREATE_BOARD_ID) return;
    if (confirm(`Are you sure you want to delete board "${card.title}"?`)) {
      this.boardService.deleteBoard(card.id);
    }
  }
}
