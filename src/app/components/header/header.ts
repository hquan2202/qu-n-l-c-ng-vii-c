// src/app/components/header/header.ts
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

import { AuthService } from '../../services/auth/auth.service';
import { InvitationService } from '../../services/invitation/invitation.service';

import { AccountPopupComponent } from '../account/account';
import { NotificationPopupComponent } from '../notification/notification';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatBadgeModule,
    AccountPopupComponent,
    NotificationPopupComponent,
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class HeaderComponent implements OnInit {
  public user: any = null;
  public isDark = false;
  public isPopupVisible = false;
  public isNotificationVisible = false;
  public headerCreateWorkspaceVisible = false;
  public searchText = '';

  // Notifications
  public notifications: any[] = [];
  public isGettingNotifications = false;

  @Output() public search = new EventEmitter<string>();

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private invitationService: InvitationService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.applyTheme();
    await this.loadUser();
  }

  // ===== User & theme =====

  private async loadUser(): Promise<void> {
    this.user = (await this.authService?.getCurrentUser?.()) ?? null;
    this.cdr.detectChanges();
  }

  private applyTheme(): void {
    if (this.isDark) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }

  // ===== Notification popup =====

  public async toggleNotificationPopup(): Promise<void> {
    this.isNotificationVisible = !this.isNotificationVisible;

    if (this.isNotificationVisible) {
      await this.reloadInvitations();
    }
  }

  public closeNotification(): void {
    this.isNotificationVisible = false;
  }

  public async reloadInvitations(): Promise<void> {
    this.isGettingNotifications = true;

    try {
      const raw = await this.invitationService.getMyInvitations();

      this.notifications = (raw ?? [])
        // backup: nếu sau này có trả thêm accepted/rejected
        .filter((inv: any) => !inv.status || inv.status === 'pending')
        .map((inv: any) => {
          const email = inv?.invited_by_email ?? 'Someone';
          const boardName =
            inv?.board_name ?? inv?.boards?.name ?? 'Unknown';

          return {
            id: inv.id,
            type: 'invite_board',
            message: `You have been invited to join board "${boardName}"`,
            createdAt: inv.created_at,
            boardId: inv.board_id,
            senderId: inv.invited_by,
            senderEmail: email,
          };
        });
    } catch (error) {
      console.error('Error loading invitations:', error);
      this.notifications = [];
    } finally {
      this.isGettingNotifications = false;
      this.cdr.detectChanges();
    }
  }



  /** Gọi khi popup báo là có thay đổi (accept/reject) */
  public async onNotificationsChanged(): Promise<void> {
    await this.reloadInvitations();
  }

  /** Số thông báo chưa xử lý (pending) */
  public get unreadCount(): number {
    return this.notifications.length;
  }

  // ===== Avatar & account popup =====

  public get avatarUrl(): string {
    return (
      this.user?.user_metadata?.['avatar_url'] ||
      'assets/images/default-avatar.png'
    );
  }

  public onAvatarError(_: Event): void {
    if (this.user && this.user.user_metadata) {
      this.user.user_metadata['avatar_url'] =
        'assets/images/default-avatar.png';
    }
    this.cdr.detectChanges();
  }

  public toggleAccountPopup(): void {
    this.isPopupVisible = !this.isPopupVisible;
  }

  public closePopup(): void {
    this.isPopupVisible = false;
  }

  public openCreateWorkspace(): void {
    this.headerCreateWorkspaceVisible = true;
  }

  public async logout(): Promise<void> {
    await this.authService?.signOut?.();
    this.user = null;
    this.closePopup();
    window.location.href = '/login';
  }

  // ===== Search =====

  public onSearch(): void {
    this.search.emit(this.searchText);
  }
}
