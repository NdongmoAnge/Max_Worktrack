import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../core/toast.service';
import { ENTERPRISES, saveEnterprises } from '../core/mock-data';
import { PageHeaderComponent } from '../shared/page-header.component';
import { IconComponent } from '../shared/icon.component';
import { TPipe } from '../shared/t.pipe';

/** Company Admin: the enterprise logo and contact details. The enterprise name is only changed by the Super Admin. */
@Component({
  selector: 'app-company-profile',
  standalone: true,
  imports: [TPipe, ReactiveFormsModule, PageHeaderComponent, IconComponent],
  template: `
    <app-page-header title="Company Profile" [crumbs]="['Company Profile']" />
    <div class="two-col">
      <div class="card form-card">
        <h3 class="card-title">{{ 'Company logo' | t }}</h3>
        <div class="logo-box">@if (auth.companyLogo()) { <img [src]="auth.companyLogo()" alt="" /> } @else { <app-icon name="building" /> }</div>
        <div class="avatar-actions">
          <label class="btn btn-outline"><app-icon name="upload" /> {{ 'Change logo' | t }}<input type="file" accept="image/*" hidden (change)="onLogo($event)" /></label>
          @if (auth.companyLogo()) { <button type="button" class="btn btn-danger-outline" (click)="removeLogo()"><app-icon name="x" /> {{ 'Remove logo' | t }}</button> }
        </div>
        <small class="hint">{{ 'PNG or JPG, up to 5 MB. Only the Company Admin can change the logo.' | t }}</small>
        @if (err()) { <small class="error" role="alert">{{ err() | t }}</small> }
      </div>
      <form class="card form-card" [formGroup]="form" (ngSubmit)="save()" novalidate>
        <h3 class="card-title">{{ 'Company details' | t }}</h3>
        <div class="form-grid">
          <div class="field full"><label for="c-name">{{ 'Enterprise Name' | t }}</label><input id="c-name" [value]="ent?.name" readonly /><small class="hint">{{ 'The enterprise name can only be changed by the Super Admin.' | t }}</small></div>
          <div class="field"><label for="c-mail">{{ 'Enterprise Email' | t }}</label><input id="c-mail" [value]="ent?.email" readonly /></div>
          <div class="field"><label for="c-ph">{{ 'Phone Number' | t }}</label><input id="c-ph" type="tel" formControlName="phone" /></div>
          <div class="field full"><label for="c-ad">{{ 'Address' | t }}</label><textarea id="c-ad" rows="3" formControlName="address"></textarea></div>
        </div>
        <div class="form-actions"><button class="btn btn-primary" type="submit" [disabled]="busy()">{{ 'Save changes' | t }}</button></div>
      </form>
    </div>`
})
export class CompanyProfileComponent {
  auth = inject(AuthService);
  private toast = inject(ToastService);
  ent = ENTERPRISES.find(e => e.name === this.auth.user()!.enterprise);
  busy = signal(false);
  err = signal('');
  form = new FormGroup({ phone: new FormControl(this.ent?.phone ?? ''), address: new FormControl(this.ent?.address ?? '') });

  /** Keep the logo small (max 320px) and transparent. */
  onLogo(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.err.set('Please choose an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { this.err.set('The image must be smaller than 5 MB.'); return; }
    this.err.set('');
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, 320 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
        this.auth.setCompanyLogo(c.toDataURL('image/png'));
        this.toast.success('Company logo updated.');
      };
      img.onerror = () => this.err.set('Please choose an image file.');
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
  removeLogo() { this.auth.setCompanyLogo(null); this.toast.info('Company logo removed.'); }

  async save() {
    this.busy.set(true);
    await new Promise(r => setTimeout(r, 600));
    if (this.ent) { Object.assign(this.ent, this.form.value); saveEnterprises(); }
    this.busy.set(false);
    this.toast.success('Changes saved successfully.');
  }
}
