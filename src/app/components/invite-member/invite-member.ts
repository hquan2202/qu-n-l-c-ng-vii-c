import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-invite-member',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './invite-member.html',
  styleUrls: ['./invite-member.css'],
})
export class InviteMemberComponent {
  @Input() inviteLink: string = '';
  @Output() close = new EventEmitter<void>();

  copyLink() {
    navigator.clipboard.writeText(this.inviteLink);
    alert('Link copied!');
  }
}
