import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../core/toast.service';
import { ROLE_LABELS } from '../core/models';
import { PageHeaderComponent } from '../shared/page-header.component';
import { TPipe } from '../shared/t.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [TPipe, ReactiveFormsModule, PageHeaderComponent],
  template: `
    <app-page-header title="Profile Settings" [crumbs]="['Profile Settings']" />
    <div class="two-col">
      <form class="card form-card" [formGroup]="info" (ngSubmit)="saveInfo()" novalidate>
        <h3 class="card-title">{{ 'Personal information' | t }}</h3>
        <div class="profile-top"><span class="avatar big">{{ auth.initials() }}</span><div><strong>{{ auth.fullName() }}</strong><small class="muted">{{ role | t }} - {{ auth.user()?.enterprise }}</small></div></div>
        <div class="form-grid">
          <div class="field"><label for="p-fn">{{ 'First name' | t }} <span class="req">*</span></label><input id="p-fn" formControlName="firstName" />
            @if (bad(info, 'firstName')) { <small class="error" role="alert">{{ 'Please enter your first name.' | t }}</small> }</div>
          <div class="field"><label for="p-ln">{{ 'Last name' | t }} <span class="req">*</span></label><input id="p-ln" formControlName="lastName" />
            @if (bad(info, 'lastName')) { <small class="error" role="alert">{{ 'Please enter your last name.' | t }}</small> }</div>
          <div class="field"><label for="p-em">{{ 'Email' | t }}</label><input id="p-em" formControlName="email" readonly /><small class="hint">{{ 'Email changes are handled by your administrator.' | t }}</small></div>
          <div class="field"><label for="p-ph">{{ 'Phone number' | t }}</label><input id="p-ph" type="tel" formControlName="phone" /></div>
        </div>
        <div class="form-actions"><button class="btn btn-primary" type="submit" [disabled]="busy()">{{ 'Save changes' | t }}</button></div>
      </form>

      <form class="card form-card" [formGroup]="pw" (ngSubmit)="savePw()" novalidate>
        <h3 class="card-title">{{ 'Change password' | t }}</h3>
        <div class="field"><label for="pw-c">{{ 'Current password' | t }} <span class="req">*</span></label><input id="pw-c" type="password" formControlName="current" />
          @if (bad(pw, 'current')) { <small class="error" role="alert">{{ 'Please enter your current password.' | t }}</small> }</div>
        <div class="field"><label for="pw-n">{{ 'New password' | t }} <span class="req">*</span></label><input id="pw-n" type="password" formControlName="next" />
          @if (bad(pw, 'next')) { <small class="error" role="alert">{{ 'The password must contain at least 8 characters.' | t }}</small> }</div>
        <div class="field"><label for="pw-k">{{ 'Confirm new password' | t }} <span class="req">*</span></label><input id="pw-k" type="password" formControlName="confirm" />
          @if (pwTried && pw.value.next !== pw.value.confirm) { <small class="error" role="alert">{{ 'The passwords do not match.' | t }}</small> }</div>
        <div class="form-actions"><button class="btn btn-primary" type="submit" [disabled]="busy()">{{ 'Update password' | t }}</button></div>
      </form>
    </div>`
})
export class ProfileComponent {
  auth = inject(AuthService);
  private toast = inject(ToastService);
  busy = signal(false);
  infoTried = false;
  pwTried = false;
  role = ROLE_LABELS[this.auth.role()!];
  info = new FormGroup({
    firstName: new FormControl(this.auth.user()!.firstName, Validators.required),
    lastName: new FormControl(this.auth.user()!.lastName, Validators.required),
    email: new FormControl(this.auth.user()!.email),
    phone: new FormControl('')
  });
  pw = new FormGroup({
    current: new FormControl('', Validators.required),
    next: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirm: new FormControl('', Validators.required)
  });

  bad(g: FormGroup, k: string) { const c = g.get(k)!; return c.invalid && (c.touched || (g === this.info ? this.infoTried : this.pwTried)); }

  async saveInfo() {
    this.infoTried = true; this.info.markAllAsTouched();
    if (this.info.invalid) return;
    await this.fake(); this.toast.success('Profile updated successfully.');
  }
  async savePw() {
    this.pwTried = true; this.pw.markAllAsTouched();
    if (this.pw.invalid || this.pw.value.next !== this.pw.value.confirm) return;
    await this.fake(); this.pw.reset(); this.pwTried = false; this.toast.success('Password updated successfully.');
  }
  private async fake() { this.busy.set(true); await new Promise(r => setTimeout(r, 700)); this.busy.set(false); }
}
