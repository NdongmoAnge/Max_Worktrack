import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../core/toast.service';
import { NAV } from '../core/nav.config';
import { ROLE_LABELS } from '../core/models';
import { IconComponent } from '../shared/icon.component';
import { TPipe } from '../shared/t.pipe';
import { LangSwitchComponent } from '../shared/lang-switch.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [TPipe, LangSwitchComponent, RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <div class="shell">
      <aside class="sidebar" [class.open]="open()" [attr.aria-label]="'Main navigation' | t">
        <div class="logo">{{ 'ReportFlow' | t }}</div>
        <nav class="nav">
          @for (item of nav(); track item.path) {
            <a [routerLink]="[auth.base(), item.path]" routerLinkActive="active" (click)="open.set(false)">
              <app-icon [name]="item.icon" /><span>{{ item.label | t }}</span>
            </a>
          }
        </nav>
        <button type="button" class="btn btn-logout" (click)="logout()"><app-icon name="logout" /> {{ 'LOGOUT' | t }}</button>
      </aside>
      @if (open()) { <div class="sidebar-backdrop" (click)="open.set(false)"></div> }

      <div class="main">
        <header class="topbar">
          <button type="button" class="icon-btn menu-btn" (click)="open.set(!open())" [attr.aria-label]="'Open navigation menu' | t"><app-icon name="menu" /></button>
          <form class="search-pill" (submit)="search($event, q.value)">
            <app-icon name="search" />
            <input #q type="search" [placeholder]="'Search' | t" [attr.aria-label]="'Search' | t" />
          </form>
          <div class="top-right">
            <app-lang-switch />
            <a class="icon-btn" [routerLink]="[auth.base(), 'dashboard']" [attr.aria-label]="'Go to dashboard' | t" [attr.title]="'Dashboard' | t"><app-icon name="home" /></a>
            @if (hasNotifications()) {
              <a class="icon-btn" [routerLink]="[auth.base(), 'notifications']" [attr.aria-label]="'Notifications' | t" [attr.title]="'Notifications' | t"><app-icon name="bell" /><i class="notif-dot"></i></a>
            }
            <span class="vbar"></span>
            <div class="user-menu">
              <button type="button" class="user-btn" (click)="menu.set(!menu())" [attr.aria-expanded]="menu()" aria-haspopup="menu">
                <span class="user-name">{{ auth.fullName() }}</span>
                <span class="avatar">{{ auth.initials() }}</span>
                <app-icon name="chevron-down" />
              </button>
              @if (menu()) {
                <div class="dropdown" role="menu">
                  <div class="dropdown-head"><strong>{{ auth.fullName() }}</strong><small>{{ roleLabel() | t }}</small></div>
                  <a role="menuitem" [routerLink]="[auth.base(), 'profile']" (click)="menu.set(false)"><app-icon name="user" /> {{ 'Profile Settings' | t }}</a>
                  <button type="button" role="menuitem" (click)="logout()"><app-icon name="logout" /> {{ 'Logout' | t }}</button>
                </div>
              }
            </div>
          </div>
        </header>
        <main class="content"><router-outlet /></main>
      </div>
    </div>`
})
export class ShellComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  open = signal(false);
  menu = signal(false);
  nav = computed(() => NAV[this.auth.role()!] ?? []);
  roleLabel = computed(() => ROLE_LABELS[this.auth.role()!] ?? '');
  hasNotifications = computed(() => this.auth.role() === 'employee' || this.auth.role() === 'intern');

  search(e: Event, v: string) {
    e.preventDefault();
    const target = this.nav()[1]?.path ?? 'dashboard';
    this.router.navigate([this.auth.base(), target], { queryParams: { q: v.trim() || null } });
  }
  logout() {
    this.auth.logout();
    this.menu.set(false);
    this.router.navigateByUrl('/login');
    this.toast.info('You have been signed out.');
  }
}
