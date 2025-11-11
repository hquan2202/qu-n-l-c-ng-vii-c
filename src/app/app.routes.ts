// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { BoardComponent } from './pages/board/board.component';
import { LoginComponent } from './pages/login/login';
import { AllTaskComponent} from './pages/all-task/all-task';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },

  // ✅ khi bấm menu “Bảng” trong sidebar => ra list board
  { path: 'board', component: HomeComponent },

  // ✅ khi mở 1 bảng cụ thể => /board/:id
  { path: 'board/:id', component: BoardComponent },

  // alias nếu bạn đang dùng `card/:id`
  { path: 'card/:id', redirectTo: 'board/:id' },

  // put specific routes before the wildcard
  { path: 'all-task', component: AllTaskComponent},

  // wildcard route for a 404 page

  { path: '**', redirectTo: 'home' },
];
