
@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {


  private async loadUser(): Promise<void> {
    this.user = await this.authService.getCurrentUser();
    this.cdr.detectChanges();
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
    this.applyTheme();
  }
  private applyTheme(): void {
    if (this.isDark) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
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

  onSearch() {
    this.search.emit(this.searchText);
  }

  toggleNotification() {
    this.showNotification = !this.showNotification;
  }
}





