// src/app/components/navbar/navbar.component.ts
import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AsyncPipe, NgIf } from '@angular/common';
import { Observable } from 'rxjs';

// Các components hiện có
import { FilterComponent } from '../filter/filter';
import { ViewPopupComponent } from '../view-popup/view-popup';
import { AccountPopupComponent } from '../account/account'; // Nếu bạn dùng
import { CreateWorkspaceComponent } from '../create-workspace/create-workspace';

// Services
import { UiFilterService } from '../../services/ui-filter/ui-filter.service';
import { AuthService } from '../../services/auth/auth.service';

// 👇 1. IMPORT BOARD SERVICE
import { BoardService } from '../../services/board/board.service';

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
    AccountPopupComponent
    // ❌ KHÔNG import SharePopupComponent ở đây nữa
  ],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavBarComponent implements OnInit {
  isSidebarOpen = false;
  isGridView = true;

  // Trạng thái các popup
  isViewOpen = false;
  isDropdownOpen = false; // Filter
  // ❌ Xóa isShareOpen vì BoardComponent sẽ quản lý popup này

  currentFilterStatus$: Observable<string | null>;

  user: any = null;
  showAccountPopup = false;
  navbarCreateWorkspaceVisible = false;

  constructor(
    private dialog: MatDialog,
    private uiFilterService: UiFilterService,
    private el: ElementRef,
    private authService: AuthService,
    private boardService: BoardService // 👇 2. INJECT SERVICE
  ) {
    this.currentFilterStatus$ = this.uiFilterService.currentFilterStatus$;
  }

  async ngOnInit(): Promise<void> {
    this.user = await this.authService.getCurrentUser();
  }

  // --- TOGGLE FUNCTIONS ---

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) this.closeOtherPopups('filter');
  }

  toggleView(): void {
    this.isViewOpen = !this.isViewOpen;
    if (this.isViewOpen) this.closeOtherPopups('view');
  }

  // 👇 3. HÀM XỬ LÝ KHI BẤM NÚT SHARE
  onShareClick(): void {
    // Chỉ đơn giản là gọi service, không bật tắt biến cục bộ nào cả
    console.log('Navbar: Bấm nút Share -> Gửi tín hiệu');
    this.boardService.triggerShareClick();

    // Đóng các popup khác nếu đang mở cho gọn
    this.closeOtherPopups('share');
  }

  toggleAccountPopup(): void {
    this.showAccountPopup = !this.showAccountPopup;
    if (this.showAccountPopup) this.closeOtherPopups('account');
  }

  // Hàm phụ trợ
  closeOtherPopups(except: string) {
    if (except !== 'filter') this.isDropdownOpen = false;
    if (except !== 'view') this.isViewOpen = false;
    // Share không cần đóng ở đây vì nó nằm ở BoardComponent
    if (except !== 'account') this.showAccountPopup = false;
  }

  // --- LOGIC CLICK OUTSIDE ---
  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    const target = event.target as HTMLElement;

    // 1. Filter
    const filterWrapper = this.el.nativeElement.querySelector('.filter-wrapper');
    if (this.isDropdownOpen && filterWrapper && !filterWrapper.contains(target)) {
      this.isDropdownOpen = false;
    }

    // 2. View
    const viewPopup = this.el.nativeElement.querySelector('app-view-popup');
    const viewIcon = this.el.nativeElement.querySelector('.view-icon');
    if (this.isViewOpen && viewPopup && !viewPopup.contains(target) && !viewIcon?.contains(target)) {
      this.isViewOpen = false;
    }

    // ❌ 4. Xóa logic clickout của Share (vì popup không còn nằm trong DOM của navbar)

    // 3. Account
    const accountPopup = this.el.nativeElement.querySelector('app-account-popup');
    if (
      this.showAccountPopup &&
      accountPopup &&
      !accountPopup.contains(target) &&
      !target.classList.contains('avatar')
    ) {
      this.showAccountPopup = false;
    }
  }

  // --- OTHER METHODS ---

  get avatarUrl(): string {
    return this.user?.user_metadata?.avatar_url || 'assets/images/default-avatar.png';
  }

  openCreateWorkspace(): void {
    this.navbarCreateWorkspaceVisible = true;
    this.dialog.open(CreateWorkspaceComponent);
  }

  async logout() {
    await this.authService.signOut();
    this.user = null;
    this.showAccountPopup = false;
    window.location.href = '/login';
  }
}
