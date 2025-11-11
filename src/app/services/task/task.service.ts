// typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Task {
  id: string;
  title: string;
  status: string;
  assignee?: string;
  description?: string;
  list?: string;
  boardId?: string;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private storageKey = 'tasks';
  private tasksSubject = new BehaviorSubject<Task[]>(this.load());
  public tasks$: Observable<Task[]> = this.tasksSubject.asObservable();

  private load(): Task[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('TaskService.load failed', e);
      return [];
    }
  }

  private persist(tasks: Task[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    } catch (e) {
      console.error('TaskService.persist failed', e);
    }
  }

  addTask(task: Partial<Task>): void {
    try {
      const id =
        task.id ??
        (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function'
          ? (crypto as any).randomUUID()
          : String(Date.now()));

      const status = (task.status ?? 'To Do').toString();
      const normalized: Task = {
        id,
        title: (task.title ?? '').toString().trim(),
        status,
        assignee: (task.assignee ?? '').toString(),
        description: (task.description ?? '').toString(),
        list: task.list ?? status,
        boardId: task.boardId,
      };

      const current = [...this.tasksSubject.value];
      const idx = current.findIndex(t => t.id === normalized.id);

      if (idx >= 0) {
        current[idx] = { ...current[idx], ...normalized };
        console.debug('TaskService.addTask -> updated', normalized.id);
      } else {
        current.push(normalized);
        console.debug('TaskService.addTask -> added', normalized.id);
      }

      this.tasksSubject.next(current);
      this.persist(current);
      console.debug('TaskService.addTask emitted and persisted', normalized);
    } catch (e) {
      console.error('TaskService.addTask failed', e);
    }
  }
  deleteTask(taskId: string): void {
    try {
      const current = [...this.tasksSubject.value];
      const updated = current.filter(t => t.id !== taskId);
      if (updated.length === current.length) {
        console.debug('TaskService.deleteTask -> nothing removed', taskId);
        return;
      }
      this.tasksSubject.next(updated);
      this.persist(updated);
      console.debug('TaskService.deleteTask -> removed', taskId);
    } catch (e) {
      console.error('TaskService.deleteTask failed', e);
    }
  }
  // helper for tests/debug
  getSnapshot(): Task[] {
    return [...this.tasksSubject.value];
  }
}
