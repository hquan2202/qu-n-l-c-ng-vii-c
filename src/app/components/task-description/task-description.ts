import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BackgroundPickerComponent } from '../background-picker/background-picker';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-task-description',
  standalone: true,
  imports: [FormsModule, CommonModule, BackgroundPickerComponent, MatIcon],
  templateUrl: './task-description.html',
  styleUrls: ['./task-description.css']
})
export class TaskDescriptionComponent {
  // 🟢 Emit đầy đủ dữ liệu bảng mới: title + background + color
  @Output() addBoard = new EventEmitter<{ title: string; background: string; color: string }>();
  @Output() close = new EventEmitter<void>();

  boardTitle = '';
  selectedBackground = 'https://images.unsplash.com/photo-1503264116251-35a269479413';
  selectedColor = '#333333'; // ✅ thêm biến màu chữ
  showPicker = false;

  backgrounds = [
    'https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=800&q=80',
  ];

  gradientBackgrounds = [
    'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
    'linear-gradient(135deg, #fbc2eb, #a6c1ee)',
    'linear-gradient(135deg, #fddb92, #d1fdff)',
    'linear-gradient(135deg, #84fab0, #8fd3f4)',
    'linear-gradient(135deg, #ffecd2, #fcb69f)',
  ];

  selectBackground(bg: string) {
    this.selectedBackground = bg;
  }

  togglePicker() {
    this.showPicker = !this.showPicker;
  }

  onBackgroundSelected(bg: string) {
    this.selectedBackground = bg;
    this.showPicker = false;
  }

  // ✅ Hàm khi bấm nút “Tạo bảng”
  onCreateBoard() {
    if (!this.boardTitle || this.boardTitle.trim() === '') {
      alert('Vui lòng nhập tiêu đề bảng trước khi tạo!');
      return;
    }

    this.addBoard.emit({
      title: this.boardTitle.trim(),
      color: this.selectedColor,
      background: this.selectedBackground || '#ffffff' // fallback
    });



    // Reset form và đóng popup
    this.boardTitle = '';
    this.showPicker = false;
    this.close.emit();
  }

  closePicker() {
    this.close.emit();
  }
}
