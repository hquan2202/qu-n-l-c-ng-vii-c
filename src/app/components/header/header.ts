import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { AccountPopupComponent } from '../account/account';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, NgIf, AccountPopupComponent],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class HeaderComponent implements OnInit {
  user: any = null;
  showAccountPopup = false;

  constructor(private auth: AuthService) {}

  async ngOnInit() {
    this.user = await this.auth.getCurrentUser();
  }

  get avatarUrl(): string {
    return this.user?.user_metadata?.avatar_url || 'assets/images/default-avatar.png';
  }

  toggleAccountPopup() {
    this.showAccountPopup = !this.showAccountPopup;
  }

  async logout() {
    await this.auth.signOut();
    window.location.href = '/login';
  }
}
