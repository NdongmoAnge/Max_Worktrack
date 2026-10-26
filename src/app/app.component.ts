import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/toast-container.component';
import { ConfirmDialogComponent } from './shared/confirm-dialog.component';
import { TPipe } from './shared/t.pipe';
import { LOGO_DARK } from './core/brand';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TPipe, RouterOutlet, ToastContainerComponent, ConfirmDialogComponent],
  template: `
    @if (splash()) {
      <div class="splash" [class.leaving]="leaving()" role="status" aria-live="polite">
        <span class="splash-orb a"></span><span class="splash-orb b"></span>
        <img class="splash-logo" [src]="logo" alt="Max WorkTrack" />
        <div class="spinner-ring" aria-hidden="true"></div>
        <div class="splash-bar" aria-hidden="true"><i></i></div>
        <p>{{ 'Preparing your workspace...' | t }}</p>
      </div>
    }
    <router-outlet /><app-toast-container /><app-confirm-dialog />`
})
export class AppComponent {
  logo = LOGO_DARK;
  splash = signal(true);
  leaving = signal(false);
  constructor() {
    setTimeout(() => this.leaving.set(true), 1700);
    setTimeout(() => this.splash.set(false), 2250);
  }
}
