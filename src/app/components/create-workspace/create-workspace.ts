import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

// 🟣 Import Angular Material modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-create-workspace',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIcon,
  ],
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
  closePicker() {
    this.close.emit();
  }
  closePopup() {
    this.close.emit();
  }

}
