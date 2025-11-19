// src/app/components/sidebar/sidebar.ts
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
import { InviteMemberComponent } from '../invite-member/invite-member';
import { MatButtonModule } from '@angular/material/button';

type Board = {
  id: string;
  title: string;
  color?: string;
  background?: string;
  tasks?: any[];
};

type Workspace = {
  id: string;
  name: string;
  type: string;
  desc?: string;
};

const STORAGE_KEY = 'boards';
const CREATE_TITLE = 'Tạo bảng mới';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
    NgIf,
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit, OnDestroy {
  isBoardsOpen = true;
  myBoards: Board[] = [];

  // danh sách workspace người dùng tạo
  workspaces: Workspace[] = [];

  // popup
  showCreatePopup = false;
  showInvitePopup = false;

  // link mời thành viên
  inviteLink: string = '';

  private onBoardsUpdatedBound = this.reload.bind(this);
  private onStorageBound = this.onStorageEvent.bind(this);

  constructor(private cdr: ChangeDetectorRef) {}

  // -------------------------------------------------
  // LIFECYCLE
  // -------------------------------------------------
  ngOnInit(): void {
    this.reload();
    window.addEventListener('boards:updated', this.onBoardsUpdatedBound as EventListener);
    window.addEventListener('storage', this.onStorageBound);
  }

  ngOnDestroy(): void {
    window.removeEventListener('boards:updated', this.onBoardsUpdatedBound as EventListener);
    window.removeEventListener('storage', this.onStorageBound);
  }

  // -------------------------------------------------
  // WORKSPACE
  // -------------------------------------------------
  addWorkspace(ws: { name: string; type: string; desc?: string }) {
    const workspace: Workspace = {
      id: 'ws_' + Date.now(),
      name: ws.name,
      type: ws.type,
      desc: ws.desc,
    };

    this.workspaces.push(workspace);
    this.cdr.markForCheck();
  }

  openCreatePopup(): void {
    this.showCreatePopup = true;
    this.cdr.markForCheck();
  }

  closeCreatePopup(): void {
    this.showCreatePopup = false;
    this.cdr.markForCheck();
  }

  // nhận link từ CreateWorkspaceComponent
  openInvitePopup(link: string) {
    this.inviteLink = link;
    this.showInvitePopup = true;
    this.cdr.markForCheck();
  }

  closeInvitePopup() {
    this.inviteLink = '';
    this.showInvitePopup = false;
    this.cdr.markForCheck();
  }

  // -------------------------------------------------
  // BOARDS
  // -------------------------------------------------
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

  private onStorageEvent(e: StorageEvent) {
    if (e.key === STORAGE_KEY) this.reload();
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
