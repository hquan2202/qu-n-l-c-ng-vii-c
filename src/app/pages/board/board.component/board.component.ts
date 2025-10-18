import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';

type Column = {
  title: string;
  cards: string[];
  newCardName: string;
};

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent {
  columns: Column[] = [
    { title: 'To Do', cards: [], newCardName: '' },
    { title: 'In Progress', cards: [], newCardName: '' },
    { title: 'Done', cards: [], newCardName: '' }
  ];

  addCard(columnIndex: number) {
    const column = this.columns[columnIndex];
    if (column.newCardName.trim() !== '') {
      column.cards.push(column.newCardName.trim());
      column.newCardName = '';
    }
  }
}

