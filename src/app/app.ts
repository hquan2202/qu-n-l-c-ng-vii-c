import { Component } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header';
import { NavBarComponent } from './components/navbar/navbar';
import { SidebarComponent } from './components/sidebar/sidebar';
import { filter } from 'rxjs/operators';

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
  isAuthPage = false;

  constructor(private router: Router) {
    // cập nhật ngay khi khởi động app
    this.updateFlags(this.router.url);

    // cập nhật mỗi khi điều hướng hoàn tất
    this.router.events
      .pipe(filter((e: Event): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.updateFlags(e.urlAfterRedirects || e.url));
  }

  private updateFlags(url: string) {
    const path = (url || '').split('?')[0]; // bỏ query params

    // Navbar cho các trang task/board/card
    this.isTaskPage = path.startsWith('/card/') || path.startsWith('/board');

    // Ẩn toàn bộ layout ở các trang đăng nhập/đăng ký/khôi phục
    this.isAuthPage =
      path.startsWith('/login') ||
      path.startsWith('/register') ||
      path.startsWith('/forgot-password');
  }
}
