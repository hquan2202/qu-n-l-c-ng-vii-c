import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgIf, NgForOf } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import {FormsModule} from '@angular/forms';
import { Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, NgIf, FormsModule, NgForOf], // 🟢 Bổ sung MatIconModule
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class HeaderComponent implements OnInit {
  user: any = null;
  searchText: string = '';
  @Output() search = new EventEmitter<string>();
  showNotification = false;

  notifications: string[] = [
    "Bạn có nhiệm vụ mới",
    "Có người vừa thêm bạn vào bảng",
    "Hạn chót công việc sắp đến"
  ];
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

  onSearch() {
    this.search.emit(this.searchText);
  }

  toggleNotification() {
    this.showNotification = !this.showNotification;
  }
}





