import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

interface Member {
  id?: number;
  name: string;
  type: 'user' | 'email';
  avatar?: string; // Mock avatar url hoặc initials
}

@Component({
  selector: 'app-share-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './share.html',
  styleUrls: ['./share.css']
})
export class SharePopupComponent {
  @Output() close = new EventEmitter<void>();

  emailInput = '';
  isLinkCopied = false;
  inviteLink = 'https://task-app.com/invite/b/xyz123'; // Link giả lập

  // Mock data: Những người ĐÃ có trong bảng
  currentMembers: Member[] = [
    { id: 1, name: 'You (Admin)', type: 'user', avatar: 'A' },
  ];

  // Mock data: Những người CÓ THỂ mời
  availableUsers: Member[] = [
    { id: 3, name: 'Bob Smith', type: 'user', avatar: 'BS' },
    { id: 4, name: 'Charlie Brown', type: 'user', avatar: 'CB' }
  ];

  // Xử lý Copy Link
  copyLink() {
    navigator.clipboard.writeText(this.inviteLink).then(() => {
      this.isLinkCopied = true;
      setTimeout(() => this.isLinkCopied = false, 2000);
    });
  }

  // Xử lý thêm thành viên từ input
  addEmail() {
    if (this.emailInput.trim()) {
      // Logic gọi API mời email ở đây
      this.currentMembers.push({
        name: this.emailInput,
        type: 'email',
        avatar: '@'
      });
      this.emailInput = '';
    }
  }

  // Chọn user từ dropdown (mô phỏng)
  selectUser(event: any) {
    const userId = Number(event.target.value);
    const user = this.availableUsers.find(u => u.id === userId);
    if (user) {
      this.currentMembers.push(user);
      // Xóa khỏi danh sách available để không mời lại
      this.availableUsers = this.availableUsers.filter(u => u.id !== userId);
    }
    event.target.value = "";
  }

  // Xóa thành viên (Remove)
  removeMember(member: Member) {
    this.currentMembers = this.currentMembers.filter(m => m !== member);
    if (member.type === 'user') {
      this.availableUsers.push(member); // Trả lại list available
    }
  }

  closePopup() {
    this.close.emit();
  }
}
