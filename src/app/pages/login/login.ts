import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service'; // ✅ Đường dẫn đúng

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  constructor(private auth: AuthService, private router: Router) {}

  async oauth(provider: 'google') {
    const { error } = await this.auth.signInWithOAuth(provider);
    if (error) {
      console.error('OAuth error:', error.message);
      alert('Đăng nhập thất bại: ' + error.message);
    }
  }

}
