import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CreateWorkspaceComponent } from '../create-workspace/create-workspace';

@Component({
  selector: 'app-account-popup',
  standalone: true,
  imports: [CommonModule, MatIconModule, CreateWorkspaceComponent],
  templateUrl: './account.html',
  styleUrls: ['./account.css']
})
export class AccountPopupComponent {
  @Input() user: any;
  @Input() visible = false;
  @Input() onLogout!: () => void;

  themeVisible = false; // popup phụ
  theme: 'light' | 'dark' = 'light';
  createWorkspaceVisible = false; // 👈 thêm dòng này

  get avatarUrl(): string {
    return (
      this.user?.user_metadata?.avatar_url ||
      this.user?.user_metadata?.picture ||
      'assets/images/default-avatar.png'
    );
  }

  toggleThemePopup() {
    this.themeVisible = !this.themeVisible;
  }

  setTheme(mode: 'light' | 'dark') {
    this.theme = mode;
    document.body.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);
    this.themeVisible = false;
  }

  ngOnInit() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      this.theme = 'dark';
      document.body.setAttribute('data-theme', 'dark');
    }
  }

  onCreateWorkspace() {
    this.createWorkspaceVisible = true; // mở popup workspace
  }
}
