import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

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
  styleUrls: ['./notification.css']
})
export class NotificationPopupComponent {
  /** Popup hiển thị hay không */
  @Input() visible: boolean = false;

  /** Danh sách thông báo */
  @Input() notiArray: any[] = [];

  /** Đang load notifications? */
  @Input() isGettingNotifications: boolean = false;

  /** Event đóng popup */
  @Output() onClose = new EventEmitter<void>();

  /** Click overlay hoặc close button */
  onCloseClick(): void {
    this.onClose.emit();
  }

  /** Scroll event */
  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    console.log('Scroll position:', target.scrollTop);
    // TODO: Thêm infinite scroll nếu cần
  }

  /** Reject invitation */
  rejectInvitation(notiId: string): void {
    console.log('Reject invitation', notiId);
    // TODO: Logic reject invitation
  }

  /** Accept invitation */
  acceptInvitation(notiId: string, boardId: string, senderId: string): void {
    console.log('Accept invitation', notiId, boardId, senderId);
    // TODO: Logic accept invitation
  }
}
