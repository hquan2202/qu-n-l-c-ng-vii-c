// File: src/app/components/header/header.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AccountPopupComponent } from '../account/account';
import { CreateWorkspaceComponent } from '../create-workspace/create-workspace';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '@supabase/auth-js'; // dùng Supabase User trực tiếp

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf, MatIconModule, AccountPopupComponent, CreateWorkspaceComponent],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  user: User | null = null; // type Supabase User
  isPopupVisible = false;
  headerCreateWorkspaceVisible = false;

  constructor(private authService: AuthService, private cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    await this.loadUser();
  }

  private async loadUser(): Promise<void> {
    this.user = await this.authService.getCurrentUser();
    this.cdr.detectChanges();
  }

  // avatar giống Navbar
  get avatarUrl(): string {
    // dùng ['avatar_url'] vì user_metadata là index signature
    return this.user?.user_metadata?.['avatar_url'] || 'assets/images/default-avatar.png';
  }

  onAvatarError(_: Event): void {
    // fallback avatar
    if (this.user && this.user.user_metadata) {
      this.user.user_metadata['avatar_url'] = 'assets/images/default-avatar.png';
    }
    this.cdr.detectChanges();
  }

  toggleAccountPopup(): void {
    this.isPopupVisible = !this.isPopupVisible;
    console.log('Popup visible:', this.isPopupVisible);
  }


  closePopup(): void {
    this.isPopupVisible = false;
  }

  openCreateWorkspace(): void {
    this.headerCreateWorkspaceVisible = true;
  }

  async logout(): Promise<void> {
    await this.authService.signOut();
    this.user = null;
    this.closePopup();
    window.location.href = '/login';
  }
}
