import { Component, Input } from '@angular/core';
import { TPipe } from '../shared/t.pipe';
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
          <div class="auth-brand">{{ 'ReportFlow' | t }}</div>
          <nav class="auth-tabs" [attr.aria-label]="'Authentication' | t">
            <a routerLink="/login" class="tab" [class.active]="active === 'login'">{{ 'LOGIN' | t }}</a>
            <a routerLink="/accept-invitation" class="tab" [class.active]="active === 'activate'">{{ 'ACTIVATE' | t }}</a>
          </nav>
        </aside>
        <section class="auth-right">
          <app-lang-switch class="auth-lang" />
          <div class="auth-main"><ng-content /></div>
          <footer class="auth-foot"><ng-content select="[footer]" /></footer>
        </section>
      </div>
    </div>`
})
export class AuthCardComponent {
  @Input() active: 'login' | 'activate' | 'none' = 'login';
}
