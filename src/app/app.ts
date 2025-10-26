import { Component } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header';
import { NavBarComponent } from './components/navbar/navbar';
import { SidebarComponent } from './components/sidebar/sidebar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    RouterModule,
    HeaderComponent,
    SidebarComponent,
    NavBarComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isTaskPage = false;

  constructor(private router: Router) {
    // Lắng nghe route change
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        // Nếu URL bắt đầu bằng /card/ → bật NavBar
        this.isTaskPage = event.urlAfterRedirects.startsWith('/card/');
        console.log('Current URL:', event.urlAfterRedirects, 'isTaskPage:', this.isTaskPage);
      }
    });
  }
}
