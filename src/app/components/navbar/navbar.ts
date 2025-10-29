import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LoginComponent } from '../../pages/login/login';
import { FilterComponent } from '../filter/filter';
import { UiFilterService } from '../../services/ui-filter/ui-filter.service';
import { AsyncPipe, NgIf, CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ViewPopupComponent } from '../view-popup/view-popup'; // đường dẫn tùy bạn

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule,
    FilterComponent,
    ViewPopupComponent,
    NgIf,
    AsyncPipe,
  ],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavBarComponent {
  isSidebarOpen = false;
  isGridView = true;
  isDarkBackground = false;
  isViewOpen = false; // 🔹 thêm dòng này

  constructor(private dialog: MatDialog) {} // inject MatDialog

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
