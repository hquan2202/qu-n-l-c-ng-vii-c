import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { BoardComponent } from './pages/board/board.component/board.component';
import { TaskDescriptionComponent} from './components/task-description/task-description';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'board', component: BoardComponent },
  { path: 'board/:id', component: TaskDescriptionComponent},
];
