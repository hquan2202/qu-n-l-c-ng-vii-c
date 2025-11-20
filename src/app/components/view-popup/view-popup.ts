import { Component, EventEmitter, Output, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-popup',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './view-popup.html',
  styleUrls: ['./view-popup.css']
})
export class ViewPopupComponent {
  @Output() close = new EventEmitter<void>();
  @Input() currentView: string = 'Board';

  constructor(private router: Router) {}

  views = [
    { name: 'Board', icon: 'view_kanban', locked: false },
    { name: 'List', icon: 'view_list', locked: false },
  ];

  closePopup() {
    this.close.emit();
  }

  selectView(view: any) {
    if (view.locked) return;

    if (view.name === 'Board') {
      this.router.navigate(['/board']);
    }

    if (view.name === 'List') {
      this.router.navigate(['/all-task']);
    }

    this.closePopup();
  }
}
