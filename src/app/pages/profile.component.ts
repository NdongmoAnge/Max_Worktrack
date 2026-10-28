import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../core/toast.service';
import { I18nService } from '../core/i18n.service';
import { ROLE_LABELS } from '../core/models';
import { PageHeaderComponent } from '../shared/page-header.component';
import { AvatarComponent } from '../shared/avatar.component';
import { IconComponent } from '../shared/icon.component';
import { TPipe } from '../shared/t.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [TPipe, ReactiveFormsModule, PageHeaderComponent, AvatarComponent, IconComponent],
  template: `
    <app-page-header title="Profile Settings" [crumbs]="['Profile Settings']" />
    <div class="two-col">
      <form class="card form-card" [formGroup]="info" (ngSubmit)="saveInfo()" novalidate>
        <h3 class="card-title">{{ 'Personal information' | t }}</h3>
        <div class="profile-top"><app-avatar size="xl" /><div><strong>{{ auth.fullName() }}</strong><small class="muted">{{ role | t }} - {{ auth.user()?.enterprise }}</small></div></div>
        <div class="avatar-actions">
          <label class="btn btn-outline"><app-icon name="upload" /> {{ 'Change profile picture' | t }}<input type="file" accept="image/*" hidden (change)="onPhoto($event)" /></label>
          @if (auth.avatar()) { <button type="button" class="btn btn-danger-outline" (click)="removePhoto()"><app-icon name="x" /> {{ 'Remove picture' | t }}</button> }
        </div>
        <small class="hint">{{ 'JPG or PNG, up to 5 MB.' | t }}</small>
        @if (photoErr()) { <small class="error" role="alert">{{ photoErr() | t }}</small> }
        <div class="form-grid">
          <div class="field"><label for="p-fn">{{ 'First name' | t }} <span class="req">*</span></label><input id="p-fn" formControlName="firstName" readonly />
            @if (bad(info, 'firstName')) { <small class="error" role="alert">{{ 'Please enter your first name.' | t }}</small> }</div>
          <div class="field"><label for="p-ln">{{ 'Last name' | t }} <span class="req">*</span></label><input id="p-ln" formControlName="lastName" readonly />
            @if (bad(info, 'lastName')) { <small class="error" role="alert">{{ 'Please enter your last name.' | t }}</small> }</div>
          <div class="field"><label for="p-em">{{ 'Email' | t }}</label><input id="p-em" formControlName="email" readonly /><small class="hint">{{ 'Email changes are handled by your administrator.' | t }}</small></div>
          <div class="field"><label for="p-ph">{{ 'Phone number' | t }}</label><input id="p-ph" type="tel" formControlName="phone" /></div>
        </div>
        <small class="hint">{{ 'Your name can only be changed by the person who created your account.' | t }}</small>
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
      <div class="card form-card">
        <h3 class="card-title">{{ 'Language' | t }}</h3>
        <p class="muted">{{ 'Choose your language, or follow your company default.' | t }}</p>
        <div class="chips" role="group" [attr.aria-label]="'Language' | t">
          <button type="button" class="chip" [class.on]="i18n.pref() === 'default'" [attr.aria-pressed]="i18n.pref() === 'default'" (click)="i18n.setDefaultPreference()">{{ 'Company default' | t }}</button>
          <button type="button" class="chip" [class.on]="i18n.pref() === 'en'" [attr.aria-pressed]="i18n.pref() === 'en'" (click)="i18n.set('en')">English</button>
          <button type="button" class="chip" [class.on]="i18n.pref() === 'fr'" [attr.aria-pressed]="i18n.pref() === 'fr'" (click)="i18n.set('fr')">Français</button>
        </div>
      </div>
    </div>`
})
export class ProfileComponent {
  auth = inject(AuthService);
  i18n = inject(I18nService);
  private toast = inject(ToastService);
  busy = signal(false);
  photoErr = signal('');

  /** Resize to a 256px square (keeps storage small), then save as the user's picture. */
  onPhoto(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.photoErr.set('Please choose an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { this.photoErr.set('The image must be smaller than 5 MB.'); return; }
    this.photoErr.set('');
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 256, c = document.createElement('canvas');
        c.width = c.height = size;
        const side = Math.min(img.width, img.height);
        c.getContext('2d')!.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
        this.auth.setAvatar(c.toDataURL('image/jpeg', 0.85));
        this.toast.success('Profile picture updated.');
      };
      img.onerror = () => this.photoErr.set('Please choose an image file.');
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
  removePhoto() { this.auth.setAvatar(null); this.toast.info('Profile picture removed.'); }
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
