import { Component } from '@angular/core';
import { CommonModule, NgClass, NgFor } from '@angular/common';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule, NgFor, NgClass],
  templateUrl: './task.html',
  styleUrls: ['./task.css']
})
export class TaskComponent {
  cards = [
    { title: 'Task 1', color: '#e6f7ff' },
    { title: 'Task 2', color: '#ffffff' }
  ];

  CREATE_TITLE = 'Tạo bảng mới';

  normalizeTitle(title: string): string {
    return title.trim().toLowerCase();
  }

  onCardClick(card: any, index: number): void {
    console.log('Card clicked:', card, index);
  }
}
