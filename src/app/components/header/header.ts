// src/app/components/header/header.ts
import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import {AccountPopupComponent} from '../account/account';
import { NotificationPopupComponent } from '../notification/notification';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, AccountPopupComponent, NotificationPopupComponent, MatIconModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  // FIX: Thêm access modifiers (public/private)
  public user: any = null;
  public isDark = false;
  public isPopupVisible = false;
  public isNotificationVisible = false;
  public headerCreateWorkspaceVisible = false;
  public searchText = '';

  @Output() public search = new EventEmitter<string>();

  // FIX: Thêm access modifiers vào constructor và sử dụng kiểu AuthService
  constructor(private authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.applyTheme();
    this.loadUser();
  }

  private async loadUser(): Promise<void> {
    // Sử dụng optional chaining (?.) an toàn hơn
    this.user = await this.authService?.getCurrentUser?.() ?? null;
    this.cdr.detectChanges();
  }


  private applyTheme(): void {
    if (this.isDark) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }

  public toggleNotificationPopup(): void {
    this.isNotificationVisible = !this.isNotificationVisible;
  }

  public closeNotification(): void {
    this.isNotificationVisible = false;
  }

  public get avatarUrl(): string {
    return this.user?.user_metadata?.['avatar_url'] || 'assets/images/default-avatar.png';
  }

  public onAvatarError(_: Event): void {
    if (this.user && this.user.user_metadata) {
      this.user.user_metadata['avatar_url'] = 'assets/images/default-avatar.png';
    }
    this.cdr.detectChanges();
  }

  public toggleAccountPopup(): void {
    this.isPopupVisible = !this.isPopupVisible;
    console.log('Popup visible:', this.isPopupVisible);
  }

  public closePopup(): void {
    this.isPopupVisible = false;
  }

  public openCreateWorkspace(): void {
    this.headerCreateWorkspaceVisible = true;
  }

  public async logout(): Promise<void> {
    // Sử dụng optional chaining (?.) an toàn hơn
    await this.authService?.signOut?.();
    this.user = null;
    this.closePopup();
    window.location.href = '/login';
  }

  public onSearch(): void {
    this.search.emit(this.searchText);
  }

}
