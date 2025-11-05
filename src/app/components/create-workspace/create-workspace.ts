import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-create-workspace',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './create-workspace.html',
  styleUrls: ['./create-workspace.css'],
})
export class CreateWorkspaceComponent {
  @Output() close = new EventEmitter<void>();

  workspaceName = '';
  workspaceType = '';
  workspaceDesc = '';

  createWorkspace() {
    if (!this.workspaceName || !this.workspaceType) return;
    console.log('Created workspace:', {
      name: this.workspaceName,
      type: this.workspaceType,
      desc: this.workspaceDesc,
    });
    this.close.emit();
  }

  closePopup() {
    this.close.emit();
  }
}
