// src/app/components/notification/notification.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { InvitationService } from '../../services/invitation/invitation.service';

@Component({
  selector: 'app-notification-popup',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule,
    MatListModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './notification.html',
  styleUrls: ['./notification.css'],
})
export class NotificationPopupComponent {
  @Input() visible: boolean = false;

  /**
   * noti mẫu:
   * {
   *   id: string;
   *   type: 'invite_board';
   *   message: string;
   *   createdAt: string | Date;
   *   boardId: string;
   *   senderId: string;
   *   senderName?: string;
   *   senderAvatarUrl?: string;
   * }
   */
  @Input() notiArray: any[] = [];
  @Input() isGettingNotifications: boolean = false;

  @Output() onClose = new EventEmitter<void>();
  @Output() changed = new EventEmitter<void>();

  processingId: string | null = null;
  lastMessage: string | null = null;

  constructor(private invitationService: InvitationService) {}

  // ===== UI =====

  onCloseClick(): void {
    this.onClose.emit();
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    console.log('Scroll position:', target.scrollTop);
  }

  private showToast(msg: string) {
    this.lastMessage = msg;
    setTimeout(() => {
      this.lastMessage = null;
    }, 2500);
  }

  /** xoá noti trong list (trong popup) + bắn sự kiện ra ngoài */
  private removeNotification(id: string) {
    this.notiArray = this.notiArray.filter(n => n.id !== id);
    // clone lại để chắc chắn trigger change detection
    this.notiArray = [...this.notiArray];
    this.changed.emit();
  }

  // ===== Actions =====

  async onRejectClick(noti: any): Promise<void> {
    if (!noti?.id || this.processingId) return;

    this.processingId = noti.id;
    try {
      await this.invitationService.rejectInvitation(noti.id);
      this.removeNotification(noti.id);

      this.showToast('You have declined the invitation.');
    } catch (err) {
      console.error('Reject invitation error', err);
      this.showToast('Failed to decline invitation.');
    } finally {
      this.processingId = null;
    }
  }

  async onAcceptClick(noti: any): Promise<void> {
    if (!noti?.id || this.processingId) return;

    this.processingId = noti.id;
    try {
      await this.invitationService.acceptInvitation(noti.id);
      this.removeNotification(noti.id);

      this.showToast('You have joined the board successfully!');
      // cho sidebar / home reload boards
      window.dispatchEvent(new CustomEvent('boards:updated'));
    } catch (err) {
      console.error('Accept invitation error', err);
      this.showToast('Failed to join the board.');
    } finally {
      this.processingId = null;
    }
  }
}
