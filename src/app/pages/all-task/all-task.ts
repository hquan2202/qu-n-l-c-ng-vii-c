// typescript
import { Component } from '@angular/core';
import { NgForOf, UpperCasePipe, AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TaskService, Task } from '../../services/task/task.service';

@Component({
  selector: 'app-all-task',
  templateUrl: './all-task.html',
  styleUrls: ['./all-task.css'],
  standalone: true,
  imports: [NgForOf, UpperCasePipe, AsyncPipe],
})
export class AllTaskComponent {
  tasks$: Observable<Task[]>;

  constructor(private taskService: TaskService) {
    this.tasks$ = this.taskService.tasks$.pipe(
      map(tasks => tasks.filter(t => t.boardId))
    );
  }

  onDelete(taskId: string): void {
    if (!taskId) return;
    if (!confirm('Delete this task?')) return;
    this.taskService.deleteTask(taskId);
  }
}
