import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Workspace {
  id: number;
  name: string;
  description?: string;
  members: string[];
}

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.html',
  styleUrls: ['./workspace.css']
})
export class WorkspaceComponent {
  workspaces: Workspace[] = [
    { id: 1, name: 'Marketing', description: 'Marketing team workspace', members: ['Alice','Bob'] },
    { id: 2, name: 'Development', description: 'Dev team workspace', members: ['Charlie','David'] }
  ];

  newWorkspaceName = '';
  newWorkspaceDesc = '';

  constructor(private router: Router) {}

  // Tạo workspace mới
  createWorkspace() {
    if (!this.newWorkspaceName.trim()) return;
    const newWs: Workspace = {
      id: this.workspaces.length + 1,
      name: this.newWorkspaceName,
      description: this.newWorkspaceDesc,
      members: []
    };
    this.workspaces.push(newWs);
    this.newWorkspaceName = '';
    this.newWorkspaceDesc = '';
  }

  // Vào workspace chi tiết
  openWorkspace(ws: Workspace) {
    this.router.navigate(['/workspace', ws.id]);
  }
}
