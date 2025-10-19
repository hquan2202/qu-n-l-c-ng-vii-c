import { Component } from '@angular/core';
import {NgClass, NgFor, NgIf} from '@angular/common';
import { TaskDescriptionComponent } from '../../components/task-description/task-description';
import { CardComponent } from '../../components/card/card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, NgIf, TaskDescriptionComponent, CardComponent, NgClass],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  showPopup = false;
  cards = JSON.parse(localStorage.getItem('boards') || '[]');

  openPopup() {
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }

  addNewBoard(board: { title: string; background: string }) {
    this.cards.push(board);
    localStorage.setItem('boards', JSON.stringify(this.cards));
    this.showPopup = false;
  }

  deleteCard(index: number) {
    this.cards.splice(index, 1);
    localStorage.setItem('boards', JSON.stringify(this.cards));
  }
}
