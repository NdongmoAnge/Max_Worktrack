import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthCardComponent } from './auth-card.component';
import { IconComponent } from '../shared/icon.component';
import { ToastService } from '../core/toast.service';
import { TPipe } from '../shared/t.pipe';

@Component({
  selector: 'app-accept-invitation',
  standalone: true,
  imports: [TPipe, ReactiveFormsModule, RouterLink, AuthCardComponent, IconComponent],
  template: `
    <app-auth-card active="activate">
      <div class="auth-avatar"><app-icon name="mail" /></div>
      <h1 class="auth-title">{{ 'ACTIVATE' | t }}</h1>

      @if (state() !== 'valid') {
        <div class="alert alert-warning" role="alert"><app-icon name="alert" /> {{ stateMessage() | t }}</div>
        <a routerLink="/login" class="btn btn-pill">{{ 'Back to login' | t }}</a>
      } @else {
        <p class="muted center">{{ 'You have been invited to manage' | t }} <strong>{{ enterprise }}</strong>.</p>
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="u-field"><app-icon name="mail" /><input type="email" [value]="email" readonly [attr.aria-label]="'Invited email address' | t" /></div>
          <div class="u-field"><app-icon name="lock" /><input type="password" formControlName="password" [placeholder]="'Password' | t" [attr.aria-label]="'Password' | t" autocomplete="new-password" /></div>
          <div class="u-field"><app-icon name="lock" /><input type="password" formControlName="confirm" [placeholder]="'Confirm password' | t" [attr.aria-label]="'Confirm password' | t" autocomplete="new-password" /></div>
          @if (mismatch()) { <small class="error" role="alert">{{ 'The passwords do not match.' | t }}</small> }
          <ul class="reqs" [attr.aria-label]="'Password requirements' | t">
            @for (r of reqs(); track r.text) { <li [class.ok]="r.ok">{{ r.ok ? '✓' : '○' }} {{ r.text | t }}</li> }
          </ul>
          <button class="btn btn-pill" type="submit" [disabled]="busy()">@if (busy()) { <span class="spinner spinner-light"></span> } {{ 'Accept Invitation' | t }}</button>
        </form>
      }
      <div footer class="demo-row">
        <span>{{ 'Preview invitation state' | t }}</span>
        <a class="chip" routerLink="/accept-invitation">{{ 'Valid' | t }}</a>
        <a class="chip" routerLink="/accept-invitation" [queryParams]="{ state: 'expired' }">{{ 'Expired' | t }}</a>
        <a class="chip" routerLink="/accept-invitation" [queryParams]="{ state: 'revoked' }">{{ 'Revoked' | t }}</a>
        <a class="chip" routerLink="/accept-invitation" [queryParams]="{ state: 'accepted' }">{{ 'Accepted' | t }}</a>
      </div>
    </app-auth-card>`
})
export class AcceptInvitationComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  state = signal('valid');
  enterprise = 'Kribi Energy';
  email = 'admin@kribi-energy.cm';
  busy = signal(false);
  submitted = signal(false);
  form = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirm: new FormControl('', [Validators.required])
  });

  constructor() {
    this.route.queryParamMap.subscribe(p => this.state.set(p.get('state') || 'valid'));
  }

  stateMessage() {
    return this.state() === 'expired' ? 'This invitation has expired. Please ask your administrator to send a new one.'
      : this.state() === 'revoked' ? 'This invitation has been revoked. Please contact your administrator.'
      : 'This invitation has already been accepted. You can log in with your password.';
  }
  reqs() {
    const p = this.form.controls.password.value || '';
    return [
      { text: 'At least 8 characters', ok: p.length >= 8 },
      { text: 'One uppercase letter', ok: /[A-Z]/.test(p) },
      { text: 'One number', ok: /[0-9]/.test(p) }
    ];
  }
  mismatch() {
    const f = this.form.value;
    return (this.submitted() || this.form.controls.confirm.touched) && f.password !== f.confirm;
  }
  async submit() {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid || this.reqs().some(r => !r.ok) || this.form.value.password !== this.form.value.confirm) {
      this.toast.error('Please fix the password requirements.');
      return;
    }
    this.busy.set(true);
    await new Promise(r => setTimeout(r, 800));
    this.busy.set(false);
    this.toast.success('Your account has been activated. You can now log in.');
    this.router.navigateByUrl('/login');
  }
}
