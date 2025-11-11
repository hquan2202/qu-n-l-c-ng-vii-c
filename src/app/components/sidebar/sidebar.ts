import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf, NgFor, NgStyle, NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CreateWorkspaceComponent } from '../create-workspace/create-workspace';

type Board = {
  id: string;
  title: string;
  color?: string;
  background?: string;
  tasks?: any[];
};

type Workspace = {
  name: string;
  type: string;
  desc?: string;
};

const STORAGE_KEY = 'boards';
const CREATE_TITLE = 'Tạo bảng mới';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, NgStyle, NgClass, CreateWorkspaceComponent, NgIf, NgFor],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit, OnDestroy {
  isBoardsOpen = true;
  myBoards: Board[] = [];
  workspaces: { name: string; type: string; desc?: string }[] = [];
  showCreatePopup = false;

  private onBoardsUpdatedBound = this.reload.bind(this);
  private onStorageBound = this.onStorageEvent.bind(this);

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.reload();
    window.addEventListener('boards:updated', this.onBoardsUpdatedBound as EventListener);
    window.addEventListener('storage', this.onStorageBound);
  }

  ngOnDestroy(): void {
    window.removeEventListener('boards:updated', this.onBoardsUpdatedBound as EventListener);
    window.removeEventListener('storage', this.onStorageBound);
  }

  addWorkspace(ws: { name: string; type: string; desc?: string }) {
    this.workspaces.push(ws);
  }
  openCreatePopup(): void {
    this.showCreatePopup = true;
    this.cdr.markForCheck();
  }

  closeCreatePopup(): void {
    this.showCreatePopup = false;
    this.cdr.markForCheck();
  }

  private onStorageEvent(e: StorageEvent) {
    if (e.key === STORAGE_KEY) this.reload();
  }

  private reload() {
    const raw = this.safeParseArray(localStorage.getItem(STORAGE_KEY));
    const boards: Board[] = raw
      .map((b: any, i: number): Board => ({
        id: String(b?.id ?? `b_${Date.now()}_${i}`),
        title: String(b?.title ?? '').trim(),
        color: b?.color ?? '#333333',
        background: b?.background ?? b?.color ?? '#ffffff',
        tasks: Array.isArray(b?.tasks) ? b.tasks : [],
      }))
      .filter((b) => b.title && b.title !== CREATE_TITLE);

    this.myBoards = boards;
    this.cdr.markForCheck();
  }

  private safeParseArray(json: string | null): any[] {
    if (!json) return [];
    try {
      const parsed = JSON.parse(json);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

}
