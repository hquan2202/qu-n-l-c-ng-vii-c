import { Component, EventEmitter, Output } from '@angular/core';
import { NgFor, NgStyle } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-background-picker',
  standalone: true,
  imports: [NgFor, NgStyle, MatIconModule],
  templateUrl: './background-picker.html',
  styleUrls: ['./background-picker.css']
})
export class BackgroundPickerComponent {
  @Output() selectBackground = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  // Ảnh nền
  backgrounds: string[] = [
    'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1770',
    'https://images.unsplash.com/photo-1596854307943-279e29c90c14?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTM0fHxwaW5rfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=900',
    'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1768',
    'https://images.unsplash.com/photo-1576845304705-e95150fec467?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1674',
    'https://images.unsplash.com/photo-1496459169807-866e74594fa8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1771',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1770',
    'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1770',
    'https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1769',
    'https://images.unsplash.com/photo-1570303345338-e1f0eddf4946?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1671',
    'https://images.unsplash.com/photo-1612278675615-7b093b07772d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1769',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1635',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1770'

  ];

// Màu gradient + màu trơn
  gradients: string[] = [
    // Gradient
    'linear-gradient(135deg, #0079bf, #5067c5)',
    'linear-gradient(135deg, #519839, #b6e67f)',
    'linear-gradient(135deg, #d29034, #f6d365)',
    'linear-gradient(135deg, #b04632, #ff7e5f)',
    'linear-gradient(135deg, #89609e, #d4a5f9)',
    'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
    'linear-gradient(135deg, #fbc2eb, #a6c1ee)',

    // Màu trơn
    '#0079bf',
    '#519839',
    '#d29034',
    '#b04632',
    '#89609e',
    '#cd5a91',
    '#ff8f00',
    '#009688',
    '#e91e63',
    '#795548',
    'yellowgreen',
    'lightslategrey',
    'lightcoral'
  ];


  pick(bg: string) {
    this.selectBackground.emit(bg);
  }

  closePicker() {
    this.close.emit();
  }
}
