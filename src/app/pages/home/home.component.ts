// File: src/app/pages/home/home.component.ts
import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { CardComponent } from '../../components/card/card';
import { TaskDescriptionComponent } from '../../components/task-description/task-description';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CardComponent, NgFor, NgIf, TaskDescriptionComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  showPopup = false;

  cards = [
    { title: 'Công việc', color: '#C6CFE9' },
    { title: 'Hoàn Thành', color: '#B5EAD6' },
    { title: 'Đang làm', color: '#FFFFD8' },
    { title: '+ Tạo bảng mới', color: '#fff' }
  ];

  openPopup(): void {
    this.showPopup = true;
  }

  closePopup(): void {
    this.showPopup = false;
  }

  addNewBoard(event: { title: string; background: string }): void {
    this.cards.splice(this.cards.length - 1, 0, {
      title: event.title,
      color: event.background
    });
    this.showPopup = false;
  }
}
