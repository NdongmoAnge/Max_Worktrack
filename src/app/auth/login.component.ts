import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthCardComponent } from './auth-card.component';
import { IconComponent } from '../shared/icon.component';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../core/toast.service';
import { I18nService } from '../core/i18n.service';
import { Role, ROLE_LABELS } from '../core/models';
import { TPipe } from '../shared/t.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [TPipe, ReactiveFormsModule, RouterLink, AuthCardComponent, IconComponent],
  template: `
    <app-auth-card active="login">
      <div class="auth-avatar"><app-icon name="user" /></div>
      <h1 class="auth-title">{{ 'LOGIN' | t }}</h1>
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        @if (failed()) {
          <div class="alert alert-error" role="alert"><app-icon name="alert" /> {{ 'Invalid email or password. Use a demo account below.' | t }}</div>
        }
        <div class="u-field">
          <app-icon name="mail" />
          <input type="email" formControlName="email" [placeholder]="'Email' | t" [attr.aria-label]="'Email' | t" autocomplete="username" />
        </div>
        @if (emailErr()) { <small class="error" role="alert">{{ emailErr() | t }}</small> }
        <div class="u-field">
          <app-icon name="lock" />
          <input type="password" formControlName="password" [placeholder]="'Password' | t" [attr.aria-label]="'Password' | t" autocomplete="current-password" />
        </div>
        @if (passErr()) { <small class="error" role="alert">{{ passErr() | t }}</small> }
        <div class="login-row">
          <a routerLink="/forgot-password" class="link-small">{{ 'Forgot Password?' | t }}</a>
          <button class="btn btn-pill" type="submit" [disabled]="loading()">
            @if (loading()) { <span class="spinner spinner-light"></span> } {{ 'LOGIN' | t }}
          </button>
        </div>
      </form>
      <div footer class="demo-row">
        <span>{{ 'Demo login as' | t }}</span>
        @for (r of roles; track r.role) {
          <button type="button" class="chip" (click)="demo(r.role)">{{ r.label | t }}</button>
        }
      </div>
    </app-auth-card>`
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private i18n = inject(I18nService);
  loading = signal(false);
  failed = signal(false);
  submitted = false;
  roles = (Object.keys(ROLE_LABELS) as Role[]).map(r => ({ role: r, label: ROLE_LABELS[r] }));

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  emailErr() {
    const c = this.form.controls.email;
    if (!(c.touched || this.submitted)) return '';
    if (c.errors?.['required']) return 'Please enter your email address.';
    if (c.errors?.['email']) return 'Please enter a valid email address.';
    return '';
  }
  passErr() {
    const c = this.form.controls.password;
    return (c.touched || this.submitted) && c.errors?.['required'] ? 'Please enter your password.' : '';
  }

  async submit() {
    this.submitted = true; this.failed.set(false);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading.set(true);
    await new Promise(r => setTimeout(r, 600));
    this.loading.set(false);
    const v = this.form.value;
    if (this.auth.login(v.email!, v.password!)) this.enter();
    else this.failed.set(true);
  }
  demo(role: Role) { this.auth.loginAs(role); this.enter(); }
  private enter() {
    this.toast.success(this.i18n.t('Welcome, {name}.', { name: this.auth.fullName() }));
    this.router.navigate([this.auth.base(), 'dashboard']);
  }
}
