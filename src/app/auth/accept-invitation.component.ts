import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TPipe } from '../shared/t.pipe';
import { AuthCardComponent } from './auth-card.component';
import { IconComponent } from '../shared/icon.component';
import { AuthService } from '../core/auth.service';
import { I18nService } from '../core/i18n.service';
import { ToastService } from '../core/toast.service';
import { effectiveStatus, lookupInvitation } from '../core/mock-data';

@Component({
  selector: 'app-accept-invitation',
  standalone: true,
  imports: [TPipe, ReactiveFormsModule, RouterLink, AuthCardComponent, IconComponent],
  template: `
    <app-auth-card active="activate" [showActivate]="true">
      <div class="auth-avatar"><app-icon name="mail" /></div>
      <h1 class="auth-title">{{ 'ACTIVATE' | t }}</h1>

      @if (state() === 'none') {
        <div class="alert alert-info" role="status"><app-icon name="info" /> {{ 'Open the invitation link you received by email to activate your account.' | t }}</div>
        <a routerLink="/login" class="btn btn-pill">{{ 'Back to login' | t }}</a>
      } @else if (state() !== 'valid') {
        <div class="alert alert-warning" role="alert"><app-icon name="alert" /> {{ stateMessage() | t }}</div>
        <a routerLink="/login" class="btn btn-pill">{{ 'Back to login' | t }}</a>
      } @else {
        <p class="muted center">{{ 'You have been invited to join {enterprise} as {role}.' | t: { enterprise: inv.enterprise, role: roleLabel() } }}</p>
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="u-field"><app-icon name="mail" /><input type="email" [value]="inv.email" readonly [attr.aria-label]="'Invited email address' | t" /></div>
          <div class="u-field"><app-icon name="lock" /><input type="password" formControlName="password" [placeholder]="'Password' | t" [attr.aria-label]="'Password' | t" autocomplete="new-password" /></div>
          <div class="u-field"><app-icon name="lock" /><input type="password" formControlName="confirm" [placeholder]="'Confirm password' | t" [attr.aria-label]="'Confirm password' | t" autocomplete="new-password" /></div>
          @if (mismatch()) { <small class="error" role="alert">{{ 'The passwords do not match.' | t }}</small> }
          <ul class="reqs" [attr.aria-label]="'Password requirements' | t">
            @for (r of reqs(); track r.text) { <li [class.ok]="r.ok">{{ r.ok ? '✓' : '○' }} {{ r.text | t }}</li> }
          </ul>
          <button class="btn btn-pill" type="submit" [disabled]="busy()">@if (busy()) { <span class="spinner spinner-light"></span> } {{ 'Accept Invitation' | t }}</button>
        </form>
      }
      <div footer class="foot-note">{{ 'Need help? Contact your administrator.' | t }}</div>
    </app-auth-card>`
})
export class AcceptInvitationComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  private auth = inject(AuthService);
  private i18n = inject(I18nService);
  token = signal<string | null>(null);
  inv: any = null;
  busy = signal(false);
  submitted = signal(false);
  form = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirm: new FormControl('', [Validators.required])
  });

  constructor() {
    this.route.queryParamMap.subscribe(p => {
      const t = p.get('token');
      this.token.set(t);
      this.inv = t ? lookupInvitation(t) : null;
    });
  }

  state(): 'none' | 'invalid' | 'expired' | 'revoked' | 'accepted' | 'valid' {
    if (!this.token()) return 'none';
    if (!this.inv) return 'invalid';
    const s = effectiveStatus(this.inv);
    return s === 'Pending' ? 'valid' : s === 'Expired' ? 'expired' : s === 'Revoked' ? 'revoked' : 'accepted';
  }
  stateMessage() {
    const s = this.state();
    return s === 'invalid' ? 'This invitation link is not valid.'
      : s === 'expired' ? 'This invitation has expired. Please ask your administrator to send a new one.'
      : s === 'revoked' ? 'This invitation has been revoked. Please contact your administrator.'
      : 'This invitation has already been accepted. You can log in with your password.';
  }
  roleLabel() { return this.inv ? this.i18n.t(this.inv.role) : ''; }
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
    const ok = this.auth.activate(this.inv, this.form.value.password!);
    this.busy.set(false);
    if (!ok) { this.toast.error('This invitation link is not valid.'); return; }
    this.toast.success('Your account has been activated. You can now log in.');
    this.router.navigateByUrl('/login');
  }
}
