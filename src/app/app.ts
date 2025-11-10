// typescript
// File: `src/app/app.component.ts`
import { Component } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header';
import { NavBarComponent } from './components/navbar/navbar';
import { SidebarComponent } from './components/sidebar/sidebar';
import { filter } from 'rxjs/operators';
import { AccountPopupComponent } from './components/account/account';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    SidebarComponent,
    NavBarComponent,
    AccountPopupComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isTaskPage = false;
  isAuthPage = false;

  constructor(private router: Router) {
    this.updateFlags(this.router.url);

    this.router.events
      .pipe(filter((e: Event): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.updateFlags(e.urlAfterRedirects || e.url));
  }

  private updateFlags(url: string) {
    const path = (url || '').split('?')[0];

    this.isTaskPage = path.startsWith('/card/') || path.startsWith('/board');

    this.isAuthPage =
      path.startsWith('/login') ||
      path.startsWith('/register') ||
      path.startsWith('/forgot-password');
  }
}
