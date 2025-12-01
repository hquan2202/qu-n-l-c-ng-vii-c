import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';


// Import Services
import { BoardService } from '../../services/board/board.service';
import { InvitationService } from '../../services/invitation/invitation.service';

@Component({
  selector: 'app-share', // 👈 Selector ngắn gọn theo tên folder của bạn
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './share.html',
  styleUrls: ['./share.css']
})
export class ShareComponent implements OnInit { // 👈 Tên Class theo file share.ts
  @Input() boardId!: string;
  @Output() close = new EventEmitter<void>();

  emailInput = '';
  isLinkCopied = false;
  isLoading = false;
  currentMembers: any[] = [];
  errorMessage = '';
  successMessage = '';
  constructor(
    private boardService: BoardService,
    private invitationService: InvitationService
  ) {}

  ngOnInit(): void {
    // Lấy danh sách thành viên
    this.boardService.boardInfo$.subscribe((info: any) => {
      if (info && info.members) {
        this.currentMembers = info.members;
      }
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 2️⃣ Hàm xử lý mời (Cập nhật logic)
  async inviteUser() {
    // 1. Reset thông báo
    this.errorMessage = '';
    this.successMessage = '';

    const email = this.emailInput.trim();

    // 2. Validate cơ bản ở Frontend
    if (!email) return;

    if (!this.isValidEmail(email)) {
      this.errorMessage = 'Email không đúng định dạng (vd: abc@gmail.com)';
      return;
    }

    try {
      this.isLoading = true;

      // 3. Gọi API
      console.log('Đang mời:', email);
      await this.invitationService.sendInvitation(this.boardId, email);

      // Nếu chạy xuống đây nghĩa là Backend trả về 200 OK -> Thành công
      this.successMessage = `Đã mời thành công: ${email}`;
      this.emailInput = '';

      // Tự tắt thông báo sau 3s
      setTimeout(() => this.successMessage = '', 3000);

    } catch (error: any) {
      console.error('API trả về lỗi:', error); // Quan trọng: Xem log này ở F12

      // 4. Xử lý lỗi dựa trên phản hồi từ Backend
      if (error instanceof HttpErrorResponse) {
        if (error.status === 404) {
          // 🔥 LỖI BẠN CẦN: Backend báo không tìm thấy user
          this.errorMessage = 'Người dùng này chưa đăng ký tài khoản!';
        } else if (error.status === 409) {
          this.errorMessage = 'Người này đã ở trong bảng rồi.';
        } else if (error.status === 400) {
          this.errorMessage = 'Yêu cầu không hợp lệ.';
        } else {
          // Lấy message chi tiết từ backend nếu có
          this.errorMessage = error.error?.message || 'Lỗi server, vui lòng thử lại.';
        }
      } else {
        this.errorMessage = 'Đã xảy ra lỗi kết nối.';
      }
    } finally {
      this.isLoading = false;
    }
  }



  copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.isLinkCopied = true;
      setTimeout(() => this.isLinkCopied = false, 2000);
    });
  }

  closePopup() {
    this.close.emit();
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  }
}
