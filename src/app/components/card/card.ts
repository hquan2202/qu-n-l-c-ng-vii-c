import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.html',
  styleUrls: ['./card.css']
})
export class CardComponent {
  @Input() title!: string;
  @Input() color!: string;
  @Output() cardClick = new EventEmitter<void>();

  onCardClick() {
    this.cardClick.emit();
  }

  @Output() delete = new EventEmitter<void>();

  hover = false;

  deleteCard(event: MouseEvent) {
    event.stopPropagation();
    this.delete.emit();
  }

  // ✅ Kiểm tra xem có phải ảnh không
  isImage(bg: string): boolean {
    return bg.startsWith('http') || bg.includes('unsplash.com');
  }

  // ✅ Trả về đúng kiểu nền (ảnh, gradient, màu trơn)
  getBackgroundStyle(): string {
    if (this.isImage(this.color)) return `url(${this.color})`;
    return this.color;
  }
}
