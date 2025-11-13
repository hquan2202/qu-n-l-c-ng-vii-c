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
  deleteTasksByBoardId(boardId: string): void {
    if (!boardId) return;
    try {
      const svcAny = this as any;
      const subj = svcAny.tasksSubject;
      const current: any[] = Array.isArray(subj?.value) ? subj.value.slice() : Array.isArray(svcAny.tasks) ? svcAny.tasks.slice() : [];

      const updated = current.filter(t => String(t?.boardId) !== String(boardId));
      if (updated.length === current.length) return;

      if (subj && typeof subj.next === 'function') subj.next(updated);

      if (typeof svcAny.persist === 'function') {
        try { svcAny.persist(updated); } catch (e) { console.error('TaskService.persist failed', e); }
      }

      console.debug('TaskService.deleteTasksByBoardId -> removed tasks for board', boardId);
    } catch (e) {
      console.error('TaskService.deleteTasksByBoardId failed', e);
    }
  }
// typescript
  private normalizeTitle(input: any): string {
    if (input === null || input === undefined) return '';
    try {
      return String(input)
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{M}/gu, ''); // remove diacritics (accents)
    } catch {
      return String(input).trim().toLowerCase();
    }
  }

  public deleteByTitle(titleOrTitles: string | string[]): void {
    const titles = Array.isArray(titleOrTitles) ? titleOrTitles : [titleOrTitles];
    const needles = new Set(titles.map(t => this.normalizeTitle(t)).filter(Boolean));
    if (needles.size === 0) return;

    try {
      const current = [...this.tasksSubject.value];
      const updated = current.filter(task => !needles.has(this.normalizeTitle(task?.title)));

      if (updated.length === current.length) {
        console.debug('TaskService.deleteByTitle -> nothing removed for', titles);
        return;
      }

      const removed = current
        .filter(task => needles.has(this.normalizeTitle(task?.title)))
        .map(task => ({ id: task.id, title: task.title }));

      this.tasksSubject.next(updated);
      this.persist(updated);

      console.debug('TaskService.deleteByTitle -> removed', removed, 'for titles', titles);
    } catch (e) {
      console.error('TaskService.deleteByTitle failed', e);
    }
  }


  public deleteLegacyTasks(): void {
    try {
      // load trực tiếp từ localStorage
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return;
      let current: Task[] = JSON.parse(raw);
      if (!Array.isArray(current)) return;

      // chỉ giữ task có boardId hợp lệ
      const updated = current.filter(t => t.boardId && t.boardId.toString().trim() !== '');

      if (updated.length === current.length) return; // không có gì thay đổi

      // persist và update BehaviorSubject
      localStorage.setItem(this.storageKey, JSON.stringify(updated));
      this.tasksSubject.next(updated);

      console.debug('TaskService.deleteLegacyTasks -> removed all legacy tasks');
    } catch (e) {
      console.error('TaskService.deleteLegacyTasks failed', e);
    }
    }

  // helper for tests/debug
  getSnapshot(): Task[] {
    return [...this.tasksSubject.value];
  }
}
