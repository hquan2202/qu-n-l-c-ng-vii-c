import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { TaskDescriptionComponent } from '../task-description/task-description';
import { BoardService, Board } from '../../services/board/board.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatMenuModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent implements OnInit {
  isPersonalExpanded = true;
  isWorkspaceExpanded = true;
  allBoards: Board[] = [];

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private boardService: BoardService
  ) {}

  ngOnInit(): void {
    this.boardService.boards$.subscribe(boards => {
      this.allBoards = boards;
    });
  }

  get personalBoards() {
    return this.allBoards.filter(b => b.type === 'personal');
  }

  get workspaceBoards() {
    return this.allBoards.filter(b => b.type === 'workspace' || !b.type);
  }

  toggleSection(section: 'personal' | 'workspace') {
    if (section === 'personal') this.isPersonalExpanded = !this.isPersonalExpanded;
    else this.isWorkspaceExpanded = !this.isWorkspaceExpanded;
  }

  openCreateBoard(defaultType: 'personal' | 'workspace') {
    const dialogRef = this.dialog.open(TaskDescriptionComponent, {
      panelClass: 'custom-dialog-container'
    });
    // @ts-ignore
    dialogRef.componentInstance.defaultType = defaultType;

    // @ts-ignore
    dialogRef.componentInstance.addBoard.subscribe((data: any) => {
      const newBoard: Board = {
        id: Date.now().toString(),
        title: data.title,
        background: data.background,
        color: data.color,
        type: data.visibility as 'personal' | 'workspace',
        columns: []
      };

      this.boardService.addBoard(newBoard);
      dialogRef.close();
    });
  }

  deleteBoard(board: Board) {
    if (confirm(`Delete "${board.title}"?`)) {
      this.boardService.deleteBoard(board.id);
      if (this.router.url.includes(`/board/${board.id}`)) {
        this.router.navigate(['/home']);
      }
    }
  }
}
