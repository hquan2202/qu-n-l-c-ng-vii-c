import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './confirm-dialog.html',
  styleUrls: ['./confirm-dialog.css']
})
export class ConfirmDialogComponent {

  // Inject MAT_DIALOG_DATA để nhận dữ liệu từ Sidebar truyền vào
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }
  ) {}

  // Bấm Cancel: Đóng popup và trả về false
  onDismiss(): void {
    this.dialogRef.close(false);
  }

  // Bấm Delete: Đóng popup và trả về true (Sidebar sẽ nhận được true và thực hiện xóa)
  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
