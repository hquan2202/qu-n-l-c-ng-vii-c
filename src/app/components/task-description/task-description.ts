import { Component, EventEmitter, Output, ViewChild, ElementRef, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BackgroundPickerComponent } from '../background-picker/background-picker';
import { MatIcon } from '@angular/material/icon';

export interface BoardMember {
  id?: number;
  name: string;
  type: 'user' | 'email';
}

@Component({
  selector: 'app-task-description',
  standalone: true,
  imports: [FormsModule, CommonModule, BackgroundPickerComponent, MatIcon],
  templateUrl: './task-description.html',
  styleUrls: ['./task-description.css']
})
export class TaskDescriptionComponent implements OnInit {

  // 🟢 1. INPUT: Nhận loại mặc định từ Sidebar
  @Input() defaultType: 'personal' | 'workspace' = 'workspace';

  // --- OUTPUTS ---
  @Output() addBoard = new EventEmitter<{
    title: string;
    background: string;
    color: string;
    members: BoardMember[];
    visibility: string;
  }>();
  @Output() close = new EventEmitter<void>();

  @ViewChild('memberSelect') memberSelect!: ElementRef;

  // --- VARIABLES ---
  boardTitle = '';
  selectedBackground = 'https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=800&q=80';
  selectedColor = '#333333';

  // Mặc định, nhưng sẽ bị ghi đè bởi ngOnInit
  selectedVisibility = 'workspace';
  showPicker = false;

  // Invite Variables
  emailInput = '';
  isLinkCopied = false;
  inviteLink = 'https://mytrello.com/invite/b/kLs23a';

  // Mock Data
  availableUsers: BoardMember[] = [
  ];
  selectedMembers: BoardMember[] = [];

  // Backgrounds
  backgrounds = [
    'https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=800&q=80',
  ];

  gradientBackgrounds = [
    'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
    'linear-gradient(135deg, #fbc2eb, #a6c1ee)',
    'linear-gradient(135deg, #fddb92, #d1fdff)',
    'linear-gradient(135deg, #84fab0, #8fd3f4)',
  ];

  // 🟢 2. ONINIT: Set giá trị cho Select Box
  ngOnInit() {
    if (this.defaultType) {
      this.selectedVisibility = this.defaultType;
    }
  }

  // --- LOGIC INVITE ---
  addMemberFromSelect(event: any) {
    const userId = Number(event.target.value);
    const user = this.availableUsers.find(u => u.id === userId);
    if (user && !this.isMemberSelected(userId)) {
      this.selectedMembers.push(user);
    }
    this.memberSelect.nativeElement.value = "";
  }

  addEmail() {
    const email = this.emailInput.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && emailRegex.test(email)) {
      const exists = this.selectedMembers.some(m => m.name === email && m.type === 'email');
      if (!exists) {
        this.selectedMembers.push({ name: email, type: 'email' });
        this.emailInput = '';
      }
    }
  }

  removeMember(member: BoardMember) {
    if (member.type === 'user') {
      this.selectedMembers = this.selectedMembers.filter(m => m.id !== member.id);
    } else {
      this.selectedMembers = this.selectedMembers.filter(m => m.name !== member.name);
    }
  }

  isMemberSelected(id: number | undefined): boolean {
    if (!id) return false;
    return this.selectedMembers.some(m => m.id === id && m.type === 'user');
  }

  copyLink() {
    navigator.clipboard.writeText(this.inviteLink).then(() => {
      this.isLinkCopied = true;
      setTimeout(() => this.isLinkCopied = false, 2000);
    });
  }

  // --- BACKGROUND LOGIC ---
  selectBackground(bg: string) { this.selectedBackground = bg; }
  togglePicker() { this.showPicker = !this.showPicker; }
  onBackgroundSelected(bg: string) { this.selectedBackground = bg; this.showPicker = false; }
  closePicker() { this.close.emit(); }

  // 🟢 3. CREATE BOARD
  onCreateBoard() {
    if (!this.boardTitle.trim()) return;

    this.addBoard.emit({
      title: this.boardTitle.trim(),
      background: this.selectedBackground,
      color: this.selectedColor,
      members: this.selectedMembers,
      visibility: this.selectedVisibility // Trả về 'personal' hoặc 'workspace'
    });

    this.boardTitle = '';
    this.selectedMembers = [];
    this.close.emit();
  }

  closePopup() {
    this.close.emit();
  }
}
