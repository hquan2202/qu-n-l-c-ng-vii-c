import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Import các component con
import { TaskDescriptionComponent } from '../task-description/task-description';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog'; // Đảm bảo đường dẫn đúng
import { BoardService, Board } from '../../services/board/board.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule // Cần thiết để Dialog hoạt động
  ],
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
      panelClass: 'custom-dialog-container', // Dùng class này để CSS global chỉnh bo góc
      width: '500px'
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

  // --- PHẦN ĐÃ SỬA ĐỔI: DÙNG CUSTOM DIALOG ---
  deleteBoard(board: Board) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      // Class này quan trọng để ép màu nền Dark Theme từ Global Styles
      panelClass: 'delete-dialog-overlay',
      data: { title: board.title }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // Người dùng bấm nút Delete trong popup
        this.boardService.deleteBoard(board.id);

        // Nếu đang ở trong board bị xóa thì quay về trang chủ
        if (this.router.url.includes(`/board/${board.id}`)) {
          this.router.navigate(['/home']);
        }
      }
    });
  }
}
