// TypeScript
// file: `src/app/components/navbar/navbar.ts`
import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FilterComponent } from '../filter/filter';
import { UiFilterService } from '../../services/ui-filter/ui-filter.service';
import { AsyncPipe, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { ViewPopupComponent } from '../view-popup/view-popup';
import { AuthService } from '../../services/auth/auth.service';
import { AccountPopupComponent } from '../account/account';
import { CreateWorkspaceComponent } from '../create-workspace/create-workspace';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatIconModule,
    MatDialogModule,
    FilterComponent,
    NgIf,
    AsyncPipe,
    ViewPopupComponent,
    AccountPopupComponent,
    CreateWorkspaceComponent
  ],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavBarComponent implements OnInit {
  isSidebarOpen = false;
  isGridView = true;
  isDarkBackground = false;
  isViewOpen = false;

  isDropdownOpen = false;
  currentFilterStatus$: Observable<string | null>;

  user: any = null;
  showAccountPopup = false;
  navbarCreateWorkspaceVisible = false;

  constructor(
    private dialog: MatDialog,
    private uiFilterService: UiFilterService,
    private el: ElementRef,
    private authService: AuthService
  ) {
    this.currentFilterStatus$ = this.uiFilterService.currentFilterStatus$;
  }

  async ngOnInit(): Promise<void> {
    this.user = await this.authService.getCurrentUser();
  }

  get avatarUrl(): string {
    return this.user?.user_metadata?.avatar_url || 'assets/images/default-avatar.png';
  }

  // match template bindings
  get isPopupVisible(): boolean {
    return this.showAccountPopup;
  }

  closePopup(): void {
    this.showAccountPopup = false;
  }

  openCreateWorkspace(): void {
    this.navbarCreateWorkspaceVisible = true;
    this.dialog.open(CreateWorkspaceComponent);
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    const filterWrapper = this.el.nativeElement.querySelector('.filter-wrapper');
    const accountPopup = this.el.nativeElement.querySelector('app-account-popup');
    const viewPopup = this.el.nativeElement.querySelector('app-view-popup');

    if (this.isDropdownOpen && filterWrapper && !filterWrapper.contains(event.target)) {
      this.isDropdownOpen = false;
    }

    if (
      this.showAccountPopup &&
      accountPopup &&
      !accountPopup.contains(event.target) &&
      !(event.target as HTMLElement).classList.contains('avatar')
    ) {
      this.showAccountPopup = false;
    }

    if (
      this.isViewOpen &&
      viewPopup &&
      !viewPopup.contains(event.target) &&
      !(event.target as HTMLElement).classList.contains('view-icon')
    ) {
      this.isViewOpen = false;
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleView(): void {
    this.isGridView = !this.isGridView;
    this.isViewOpen = !this.isViewOpen;
  }

  toggleAccountPopup(): void {
    this.showAccountPopup = !this.showAccountPopup;
  }

  async logout() {
    await this.authService.signOut();
    this.user = null;
    this.showAccountPopup = false;
    window.location.href = '/login';
  }
}
