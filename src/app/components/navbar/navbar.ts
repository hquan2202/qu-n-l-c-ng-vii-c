import { Component, OnInit, HostListener, ElementRef } from '@angular/core'; // 🔥 THÊM HostListener, ElementRef
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LoginComponent } from '../../pages/login/login';
import { FilterComponent } from '../filter/filter';
import { UiFilterService } from '../../services/ui-filter/ui-filter.service';
import { AsyncPipe, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import {ViewPopupComponent} from '../view-popup/view-popup'; // đường dẫn tùy bạn
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-navbar',
  standalone: true,
<<<<<<< HEAD
  imports: [MatIconModule, MatDialogModule, FilterComponent, NgIf, AsyncPipe],
  templateUrl:'./navbar.html',
=======
  imports: [  CommonModule,
                    MatIconModule,
                    MatDialogModule,
                    ViewPopupComponent],
  templateUrl: './navbar.html',
>>>>>>> upstream/master
  styleUrls: ['./navbar.css']
})
export class NavBarComponent implements OnInit {
  isSidebarOpen = false;
  isGridView = true;
  isDarkBackground = false;
  isViewOpen = false; // 🔹 thêm dòng này

  isDropdownOpen: boolean = false;
  currentFilterStatus$: Observable<string | null>;

  // 🔥 Inject ElementRef, MatDialog VÀ UiFilterService
  constructor(
    private dialog: MatDialog,
    private uiFilterService: UiFilterService,
    private el: ElementRef // Inject ElementRef để truy cập DOM
  ) {
    this.currentFilterStatus$ = this.uiFilterService.currentFilterStatus$;
  }

  ngOnInit(): void {}

  /**
   * 🔥 LOGIC CLICK OUT: Xử lý sự kiện click chuột trên toàn bộ document.
   * Nếu click xảy ra bên ngoài filter-wrapper VÀ dropdown đang mở, đóng dropdown.
   */
  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    // 1. Chỉ thực hiện nếu dropdown đang mở
    if (!this.isDropdownOpen) return;

    // 2. Tìm phần tử chứa filter (filter-wrapper) bên trong component này
    const filterWrapper = this.el.nativeElement.querySelector('.filter-wrapper');

    // 3. Kiểm tra xem sự kiện click có nằm trong filterWrapper không
    // Nếu click nằm NGOÀI vùng filterWrapper, đóng dropdown.
    if (filterWrapper && !filterWrapper.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  // Chuyển đổi trạng thái mở/đóng dropdown
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Đóng dropdown (dùng khi FilterComponent phát sự kiện chọn xong)
  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    console.log('Sidebar toggled:', this.isSidebarOpen);
  }

  toggleView(): void {
    this.isViewOpen = !this.isViewOpen; // 🔹 bật/tắt popup
    console.log('View mode toggled:', this.isGridView ? 'Grid' : 'List');
  }


  toggleBackground(): void {
    this.isDarkBackground = !this.isDarkBackground;
    console.log('Background toggled:', this.isDarkBackground ? 'Dark' : 'Light');
  }

  openLoginPopup(): void {
    this.dialog.open(LoginComponent, {
      width: '400px',
      panelClass: 'custom-dialog',
    });
  }
}
