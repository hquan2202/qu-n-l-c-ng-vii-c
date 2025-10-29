import { Component, EventEmitter, Output } from '@angular/core';
import {MatIconModule } from '@angular/material/icon';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-view-popup',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './view-popup.html',
  styleUrls: ['./view-popup.css']
})
export class ViewPopupComponent {
  @Output() close = new EventEmitter<void>();

  views = [
    { name: 'Bảng', icon: 'view_kanban', locked: false },
    { name: 'Lịch', icon: 'calendar_month', locked: true },
  ];

  closePopup() {
    this.close.emit();
  }
}
