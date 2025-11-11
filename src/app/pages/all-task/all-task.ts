// File: `src/app/pages/all-task/all-task.ts`
import { Component } from '@angular/core';
import { NgForOf, UpperCasePipe, AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
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
    this.tasks$ = this.taskService.tasks$;
  }

  deleteTask(taskId: string | undefined): void {
    if (!taskId) return;
    if (!confirm('Delete this task?')) return;
    this.taskService.deleteTask(taskId);
  }

  deleteTasksWithoutBoard(): void {
    if (!confirm('Delete tasks without board link (legacy)?')) return;
    (this.taskService as any).deleteTasksWithoutBoard?.();
  }

  deleteAllTasks(): void {
    if (!confirm('Delete ALL tasks? This cannot be undone.')) return;
    (this.taskService as any).deleteAllTasks?.();
  }
}
