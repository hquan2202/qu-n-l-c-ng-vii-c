import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog'; // ✅ thêm dòng này

@Component({
  selector: 'app-login-popup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-popup.html',
  styleUrls: ['./login-popup.css']
})
export class LoginPopupComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;

  // ✅ Inject MatDialogRef để có thể đóng popup đúng chuẩn
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dialogRef: MatDialogRef<LoginPopupComponent> // 👈 thêm dòng này
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
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

    if (email === 'user@example.com' && password === '123456') {
      if (remember) {
        localStorage.setItem('auth', JSON.stringify({ email, token: 'demo-token' }));
      }
      alert('Đăng nhập thành công!');
      this.router.navigate(['/board']).then(() => this.closePopup());
    } else {
      alert('Email hoặc mật khẩu không đúng.');
    }
  }

  // ✅ Dùng MatDialogRef để đóng popup
  closePopup() {
    this.dialogRef.close();
  }

  oauth(provider: 'google' | 'github') {
    alert('OAuth demo: ' + provider);
  }

  forgot() {
    this.router.navigate(['/forgot-password']).then(() => this.closePopup());
  }

  register() {
    this.router.navigate(['/register']).then(() => this.closePopup());
  }
}
