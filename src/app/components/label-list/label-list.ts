import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'label-list', // <label-list> sẽ được dùng trong HTML
  standalone: true,
  imports: [CommonModule],
  templateUrl: './label-list.html',
  styleUrls: ['./label-list.css']
})
export class LabelListComponent {
  @Input() list: any;
  @Output() cardAdded = new EventEmitter<{ list: any, card: string }>();

  addCard(value: string) {
    if (value.trim()) {
      this.cardAdded.emit({ list: this.list, card: value.trim() });
    }
  }
}
