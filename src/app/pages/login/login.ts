import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators,} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule

  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [ Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  get f() { return this.loginForm.controls; }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, password, remember } = this.loginForm.value;
// Demo: giả lập xác thực
    // Thay bằng service gọi API thực tế của bạn
    if (email === 'user@example.com' && password === '123456') {
      // nếu "remember" thì lưu token/localStorage tùy nhu cầu
      if (remember) {
        localStorage.setItem('auth', JSON.stringify({ email, token: 'demo-token' }));
      }
      // chuyển hướng vào app chính
      this.router.navigate(['/board']).then(r => {});
    } else {
      // hiển thị lỗi cơ bản (bạn có thể dùng toast)
      alert('Email hoặc mật khẩu không đúng (dùng user@example.com / 123456 cho demo).');
    }
  }

  oauth(provider: 'google' | 'github') {
    // Gọi API OAuth của bạn hoặc mở popup
    alert('OAuth demo: ' + provider);
  }
  forgot() {
    // điều hướng tới trang quên mật khẩu
    this.router.navigate(['/forgot-password']).then(r =>  {});
  }
  register() {
    this.router.navigate(['/register']).then(r =>  {});
  }
}


