import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthCardComponent } from './auth-card.component';
import { IconComponent } from '../shared/icon.component';
import { ToastService } from '../core/toast.service';
import { TPipe } from '../shared/t.pipe';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [TPipe, ReactiveFormsModule, RouterLink, AuthCardComponent, IconComponent],
  template: `
    <app-auth-card active="none">
      <div class="auth-avatar"><app-icon name="lock" /></div>
      <h1 class="auth-title">{{ 'FORGOT PASSWORD' | t }}</h1>
      @if (sent()) {
        <div class="alert alert-info" role="status"><app-icon name="info" /> {{ 'If an account exists for that email, a reset link has been sent.' | t }}</div>
        <a routerLink="/login" class="btn btn-pill">{{ 'Back to login' | t }}</a>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="u-field"><app-icon name="mail" /><input type="email" formControlName="email" [placeholder]="'Email' | t" [attr.aria-label]="'Email' | t" /></div>
          @if (err()) { <small class="error" role="alert">{{ err() | t }}</small> }
          <div class="login-row">
            <a routerLink="/login" class="link-small">{{ 'Back to login' | t }}</a>
            <button class="btn btn-pill" type="submit" [disabled]="busy()">@if (busy()) { <span class="spinner spinner-light"></span> } {{ 'Send link' | t }}</button>
          </div>
        </form>
      }
      <div footer class="demo-row"><span>{{ 'Remembered it?' | t }}</span><a class="chip" routerLink="/login">{{ 'Go to login' | t }}</a></div>
    </app-auth-card>`
})
export class ForgotPasswordComponent {
  sent = signal(false);
  busy = signal(false);
  tried = false;
  form = new FormGroup({ email: new FormControl('', [Validators.required, Validators.email]) });
  err() {
    const c = this.form.controls.email;
    if (!(c.touched || this.tried)) return '';
    return c.errors?.['required'] ? 'Please enter your email address.' : c.errors?.['email'] ? 'Please enter a valid email address.' : '';
  }
  async submit() {
    this.tried = true; this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.busy.set(true);
    await new Promise(r => setTimeout(r, 700));
    this.busy.set(false); this.sent.set(true);
  }
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [TPipe, ReactiveFormsModule, RouterLink, AuthCardComponent, IconComponent],
  template: `
    <app-auth-card active="none">
      <div class="auth-avatar"><app-icon name="lock" /></div>
      <h1 class="auth-title">RESET PASSWORD</h1>
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="u-field"><app-icon name="lock" /><input type="password" formControlName="password" placeholder="New password" aria-label="New password" /></div>
        <div class="u-field"><app-icon name="lock" /><input type="password" formControlName="confirm" placeholder="Confirm new password" aria-label="Confirm new password" /></div>
        @if (err()) { <small class="error" role="alert">{{ err() | t }}</small> }
        <div class="login-row">
          <a routerLink="/login" class="link-small">Cancel</a>
          <button class="btn btn-pill" type="submit" [disabled]="busy()">@if (busy()) { <span class="spinner spinner-light"></span> } {{ 'Reset' | t }}</button>
        </div>
      </form>
      <div footer class="demo-row"><span>{{ 'Use at least 8 characters.' | t }}</span></div>
    </app-auth-card>`
})
export class ResetPasswordComponent {
  private router = inject(Router);
  private toast = inject(ToastService);
  busy = signal(false);
  tried = false;
  form = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirm: new FormControl('', [Validators.required])
  });
  err() {
    if (!this.tried) return '';
    const v = this.form.value;
    if (!v.password) return 'Please enter a new password.';
    if (v.password.length < 8) return 'The password must contain at least 8 characters.';
    if (v.password !== v.confirm) return 'The passwords do not match.';
    return '';
  }
  async submit() {
    this.tried = true;
    if (this.err()) return;
    this.busy.set(true);
    await new Promise(r => setTimeout(r, 700));
    this.busy.set(false);
    this.toast.success('Password updated. You can now log in.');
    this.router.navigateByUrl('/login');
  }
}
