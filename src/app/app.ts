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

  constructor(private router: Router) {
    // set trạng thái ngay lần boot đầu
    this.updateFlag(this.router.url);

    // cập nhật mỗi lần điều hướng hoàn tất
    this.router.events
      .pipe(filter((e: Event): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.updateFlag(e.urlAfterRedirects || e.url));
  }

  private updateFlag(url: string) {
    const path = (url || '').split('?')[0]; // bỏ query params
    // ✔ Giữ behavior cũ cho /card/:id và thêm /board
    this.isTaskPage = path.startsWith('/card/') || path.startsWith('/board');
    // Nếu mai mốt muốn mở rộng, có thể dùng:
    // const useNavbarOn = ['/card/', '/board'];
    // this.isTaskPage = useNavbarOn.some(p => path.startsWith(p));
  }
}
