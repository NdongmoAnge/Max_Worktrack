import { Component, Input } from '@angular/core';
import { TPipe } from '../shared/t.pipe';
import { LOGO_WHITE } from '../core/brand';
import { LangSwitchComponent } from '../shared/lang-switch.component';
import { RouterLink } from '@angular/router';

/** Split login card: patterned blue panel with tabs on the left, form on the right. */
@Component({
  selector: 'app-auth-card',
  standalone: true,
  imports: [TPipe, LangSwitchComponent, RouterLink],
  template: `
    <div class="auth-bg">
      <div class="auth-card">
        <aside class="auth-left">
          <span class="shape s1"></span><span class="shape s2"></span><span class="shape s3"></span>
          <img class="auth-logo" [src]="logoWhite" alt="Max WorkTrack" />
          <nav class="auth-tabs" [attr.aria-label]="'Authentication' | t">
            <a routerLink="/login" class="tab" [class.active]="active === 'login'">{{ 'LOGIN' | t }}</a>
            @if (showActivate) { <a class="tab" [class.active]="active === 'activate'">{{ 'ACTIVATE' | t }}</a> }
          </nav>
        </aside>
        <section class="auth-right">
          <a class="auth-back" routerLink="/welcome"><span aria-hidden="true">←</span> {{ 'Back to welcome page' | t }}</a>
          <app-lang-switch class="auth-lang" />
          <div class="auth-main"><ng-content /></div>
          <footer class="auth-foot"><ng-content select="[footer]" /></footer>
        </section>
      </div>
    </div>`
})
export class AuthCardComponent {
  logoWhite = LOGO_WHITE;
  /** The activation tab only exists on the page opened from the emailed invitation link. */
  @Input() showActivate = false;
  @Input() active: 'login' | 'activate' | 'none' = 'login';
}
