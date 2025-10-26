import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Board } from '../../models/board.model';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task.html',
  styleUrls: ['./task.css']
})
export class TaskComponent {
  @Input() board?: Board;

  // 🔹 khai báo event back
  @Output() back = new EventEmitter<void>();

  // ví dụ: gọi khi muốn back
  closeBoard() {
    this.back.emit();
  }
}
