import { Component } from '@angular/core';
import { NgForOf, UpperCasePipe, AsyncPipe, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TaskService, Task } from '../../services/task/task.service';

// Tạo interface mới mở rộng từ Task để chứa thêm tên bảng
interface TaskWithBoard extends Task {
  boardTitle?: string;
}

@Component({
  selector: 'app-all-task',
  templateUrl: './all-task.html',
  styleUrls: ['./all-task.css'],
  standalone: true,
  imports: [NgForOf, UpperCasePipe, AsyncPipe],
})
export class AllTaskComponent {
  tasks$: Observable<TaskWithBoard[]>;

  constructor(private taskService: TaskService) {
    // 1. Lấy danh sách Bảng từ LocalStorage
    let boards: any[] = [];
    try {
      boards = JSON.parse(localStorage.getItem('boards') || '[]');
    } catch {
      boards = [];
    }

    // 2. Map dữ liệu để thêm tên bảng vào task
    this.tasks$ = this.taskService.tasks$.pipe(
      map(tasks => {
        // Lọc task rác (không có boardId) nếu cần
        return tasks
          .filter(t => t.boardId)
          .map(task => {
            // Tìm bảng tương ứng
            const board = boards.find(b => b.id === task.boardId);
            return {
              ...task,
              boardTitle: board ? board.title : 'Unknown Board' // Lấy tên hoặc hiển thị mặc định
            };
          });
      })
    );
  }
}
