import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {NgClass, NgIf} from '@angular/common';
@Component({
  selector: 'app-account-popup',
  standalone: true,
  templateUrl: './account.html',
  imports: [
    MatIconModule,
    NgIf,
    NgClass
  ],
  styleUrls: ['./account.css']
})
export class AccountPopupComponent {
  @Input() position: string = 'default';
  @Input() visible: boolean = false;
  @Input() user: any = null;
  @Input() avatarUrl: string | null = null;

  // outputs
  @Output() onClose = new EventEmitter<void>();
  @Output() onLogout = new EventEmitter<void>();
  @Output() onCreateWorkspace = new EventEmitter<void>();


  onCloseClick(): void {
    this.onClose.emit();
  }

  onLogoutClick(): void {
    this.onLogout.emit();
  }

  onCreateWorkspaceClick(): void {
    this.onCreateWorkspace.emit();
  }
}
