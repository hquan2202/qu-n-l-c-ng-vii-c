import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, NgIf], // 🟢 Bổ sung MatIconModule
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class HeaderComponent implements OnInit {
  user: any = null;

  constructor(private auth: AuthService) {}

  async ngOnInit() {
    this.user = await this.auth.getCurrentUser();
  }

  get avatarUrl(): string {
    return this.user?.user_metadata?.avatar_url || 'assets/images/default-avatar.png';
  }

  async logout() {
    await this.auth.signOut();
    window.location.href = '/login';
  }
}
