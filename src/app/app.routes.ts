import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { BoardComponent } from './pages/board/board.component/board.component';
import { TaskDescriptionComponent} from './components/task-description/task-description';
import { LoginComponent } from './pages/login/login';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {path: 'login', component: LoginComponent},
  { path: 'home', component: HomeComponent },
  { path: 'board', component: BoardComponent },
];
