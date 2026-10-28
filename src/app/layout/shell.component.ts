import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../core/toast.service';
import { NAV } from '../core/nav.config';
import { ROLE_LABELS } from '../core/models';
import { IconComponent } from '../shared/icon.component';
import { TPipe } from '../shared/t.pipe';
import { LangSwitchComponent } from '../shared/lang-switch.component';
import { AvatarComponent } from '../shared/avatar.component';
import { LOGO, LOGO_DARK } from '../core/brand';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [TPipe, LangSwitchComponent, AvatarComponent, RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <div class="shell">
      <aside class="sidebar" [class.open]="open()" [attr.aria-label]="'Main navigation' | t">
        <div class="side-top">
          <a class="brand-link" [routerLink]="[auth.base(), 'dashboard']" (click)="open.set(false)"><img class="brand-logo" [src]="logoDark" alt="Max WorkTrack" /></a>
          <button type="button" class="icon-btn drawer-close" (click)="open.set(false)" [attr.aria-label]="'Close menu' | t"><app-icon name="x" /></button>
        </div>
        <nav class="nav">
          @for (item of nav(); track item.path) {
            <a [routerLink]="[auth.base(), item.path]" routerLinkActive="active" (click)="open.set(false)">
              <app-icon [name]="item.icon" /><span>{{ item.label | t }}</span>
            </a>
          }
        </nav>
        <div class="side-bottom">
          <app-lang-switch />
          <a class="side-user" [routerLink]="[auth.base(), 'profile']" (click)="open.set(false)">
            <app-avatar />
            <span class="side-user-text"><strong>{{ auth.fullName() }}</strong><small>{{ roleLabel() | t }}</small></span>
          </a>
          <button type="button" class="btn btn-logout" (click)="logout()"><app-icon name="logout" /> {{ 'LOGOUT' | t }}</button>
        </div>
      </aside>
      @if (open()) { <div class="sidebar-backdrop" (click)="open.set(false)"></div> }

      <div class="main">
        <header class="topbar">
          <button type="button" class="icon-btn menu-btn" (click)="open.set(true)" [attr.aria-label]="'Open navigation menu' | t" [attr.aria-expanded]="open()"><app-icon name="menu" /></button>
          <a class="top-logo" [routerLink]="[auth.base(), 'dashboard']"><img [src]="logo" alt="Max WorkTrack" /></a>
          <span class="top-context">@if (auth.companyLogo()) { <img class="top-co-logo" [src]="auth.companyLogo()" alt="" /> } @else { <app-icon name="building" /> } {{ auth.user()?.enterprise }}@if (auth.user()?.branch) { · {{ auth.user()?.branch | t }} }</span>
          <a class="top-profile" [routerLink]="[auth.base(), 'profile']" [attr.title]="'Profile Settings' | t">
            <span class="top-profile-text"><strong>{{ auth.fullName() }}</strong><small>{{ 'Profile Settings' | t }}</small></span>
            <app-avatar />
          </a>
        </header>
        <main class="content"><router-outlet /></main>
      </div>
    </div>`
})
export class ShellComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  logo = LOGO;
  logoDark = LOGO_DARK;
  open = signal(false);
  nav = computed(() => NAV[this.auth.role()!] ?? []);
  roleLabel = computed(() => ROLE_LABELS[this.auth.role()!] ?? '');

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/welcome');
    this.toast.info('You have been signed out.');
  }
}
