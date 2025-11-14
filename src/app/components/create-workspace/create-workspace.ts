// src/app/components/create-workspace/create-workspace.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-workspace',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './create-workspace.html',
  styleUrls: ['./create-workspace.css'],
})
export class CreateWorkspaceComponent {
  @Output() close = new EventEmitter<void>();
  @Output() workspaceCreated = new EventEmitter<{ id?: string; name: string; type: string; desc?: string; inviteLink?: string }>();

  workspaceName = '';
  workspaceType = '';
  workspaceDesc = '';

  constructor(private router: Router) {}

  createWorkspace() {
    if (!this.workspaceName.trim() || !this.workspaceType) return;

    const workspace = {
      id: `ws_${Date.now()}`,
      name: this.workspaceName.trim(),
      type: this.workspaceType,
      desc: this.workspaceDesc?.trim(),
    };

    const inviteLink =
      'https://mytaskapp.com/invite/' +
      this.workspaceName.toLowerCase().replace(/\s+/g, '-') +
      '-' +
      Math.random().toString(36).substring(2, 8);

    // Emit created workspace (parent can persist it)
    this.workspaceCreated.emit({ ...workspace, inviteLink });

    // Reset local fields
    this.workspaceName = '';
    this.workspaceType = '';
    this.workspaceDesc = '';

    // Close the create popup UI
    this.close.emit();

    // Navigate to the workspace page (change route as needed)
    this.router.navigate(['/workspace', workspace.id]);
  }

  closePopup() {
    this.close.emit();
  }
}
