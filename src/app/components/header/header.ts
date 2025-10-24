import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { LoginPopupComponent } from '../login-popup/login-popup';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, MatDialogModule ],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  constructor(private dialog: MatDialog) {}

  openLoginPopup(): void {
    this.dialog.open(LoginPopupComponent, {
      width: '420px',
      disableClose: false,
      panelClass: 'custom-dialog-container'
    });

  }
}

