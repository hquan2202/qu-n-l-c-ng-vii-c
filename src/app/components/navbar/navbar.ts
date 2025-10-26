import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LoginComponent } from '../../pages/login/login'; // đường dẫn tùy bạn

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatIconModule, MatDialogModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavBarComponent {
  isSidebarOpen = false;
  isGridView = true;
  isDarkBackground = false;

  constructor(private dialog: MatDialog) {} // inject MatDialog

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    console.log('Sidebar toggled:', this.isSidebarOpen);
  }

  toggleView(): void {
    this.isGridView = !this.isGridView;
    console.log('View mode toggled:', this.isGridView ? 'Grid' : 'List');
  }

  toggleBackground(): void {
    this.isDarkBackground = !this.isDarkBackground;
    console.log('Background toggled:', this.isDarkBackground ? 'Dark' : 'Light');
  }

  openLoginPopup(): void {
    this.dialog.open(LoginComponent, {
      width: '400px',      // chiều rộng dialog
      panelClass: 'custom-dialog', // nếu muốn custom CSS
    });
  }
}
