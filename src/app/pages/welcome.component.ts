import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { LOGO_DARK } from '../core/brand';
import { IconComponent } from '../shared/icon.component';
import { LangSwitchComponent } from '../shared/lang-switch.component';
import { TPipe } from '../shared/t.pipe';
import { CarouselComponent } from '../shared/carousel.component';
import { SiteFooterComponent } from '../shared/site-footer.component';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [TPipe, CarouselComponent, SiteFooterComponent, RouterLink, IconComponent, LangSwitchComponent],
  template: `
    <div class="wl">
      <section class="wl-hero">
        <span class="wl-orb a"></span><span class="wl-orb b"></span><span class="wl-orb c"></span>
        <div class="wl-wrap">
          <header class="wl-nav">
            <img [src]="logo" alt="Max WorkTrack" />
            <div class="wl-nav-actions">
              <app-lang-switch />
              @if (auth.user()) {
                <a class="btn btn-light" [routerLink]="[auth.base(), 'dashboard']">{{ 'Go to my dashboard' | t }}</a>
              } @else {
                <a class="btn btn-light" routerLink="/login">{{ 'Sign in' | t }}</a>
              }
            </div>
          </header>

          <div class="wl-grid">
            <div class="wl-copy">
              <span class="wl-pill"><app-icon name="activity" /> {{ 'Report and project management' | t }}</span>
              <h1><span>{{ 'Track work.' | t }}</span> <span class="grad">{{ 'Review reports.' | t }}</span> <span>{{ 'Deliver projects.' | t }}</span></h1>
              <p>{{ 'Max WorkTrack helps enterprises manage projects, teams and weekly activity reports in one place.' | t }}</p>
              <div class="wl-cta">
                @if (auth.user()) {
                  <a class="btn btn-light btn-lg" [routerLink]="[auth.base(), 'dashboard']">{{ 'Go to my dashboard' | t }} <app-icon name="chevron-right" /></a>
                } @else {
                  <a class="btn btn-light btn-lg" routerLink="/login">{{ 'Sign in' | t }} <app-icon name="chevron-right" /></a>
                  <a class="btn btn-ghost btn-lg" routerLink="/accept-invitation">{{ 'Activate my account' | t }}</a>
                }
              </div>
            </div>

            <div class="wl-visual"><app-carousel /></div>
          </div>
        </div>
      </section>

      <section class="wl-section">
        <div class="wl-wrap">
          <div class="wl-head"><h2>{{ 'Everything your team needs' | t }}</h2><p>{{ 'One simple platform for reports, projects and people.' | t }}</p></div>
          <div class="wl-features">
            @for (f of features; track f.t) {
              <article class="wl-feature">
                <span class="wl-ico"><app-icon [name]="f.icon" /></span>
                <h3>{{ f.t | t }}</h3>
                <p>{{ f.d | t }}</p>
              </article>
            }
          </div>
        </div>
      </section>

      <section class="wl-section alt">
        <div class="wl-wrap">
          <div class="wl-head"><h2>{{ 'How it works' | t }}</h2></div>
          <div class="wl-steps">
            @for (s of steps; track s.n) {
              <div class="wl-step"><span class="wl-num">{{ s.n }}</span><h3>{{ s.t | t }}</h3><p>{{ s.d | t }}</p></div>
            }
          </div>
        </div>
      </section>


      <section class="wl-cta-band">
        <div class="wl-wrap">
          <h2>{{ 'Ready to get started?' | t }}</h2>
          <p>{{ 'Sign in to your workspace or activate the account you were invited to.' | t }}</p>
          <div class="wl-cta center-cta">
            @if (auth.user()) {
              <a class="btn btn-light btn-lg" [routerLink]="[auth.base(), 'dashboard']">{{ 'Go to my dashboard' | t }}</a>
            } @else {
              <a class="btn btn-light btn-lg" routerLink="/login">{{ 'Sign in' | t }}</a>
              <a class="btn btn-ghost btn-lg" routerLink="/accept-invitation">{{ 'Activate my account' | t }}</a>
            }
          </div>
        </div>
      </section>

      <app-site-footer />
    </div>`
})
export class WelcomeComponent {
  auth = inject(AuthService);
  logo = LOGO_DARK;
  features = [
    { icon: 'file', t: 'Weekly activity reports', d: 'Report on several projects in one week, with clear start, end and actual end dates.' },
    { icon: 'folder', t: 'Project tracking', d: 'Follow progress, planned and actual dates and delays at a glance.' },
    { icon: 'dashboard', t: 'Live dashboards', d: 'Statistics, charts and recent activity at a glance.' },
    { icon: 'check-square', t: 'Review workflow', d: 'Reports are approved, rejected or sent back for correction, with comments.' },
    { icon: 'calendar', t: 'Flexible report dates', d: 'Choose the day each person must submit the weekly report.' },
    { icon: 'activity', t: 'English and French', d: 'Switch language at any time from the menu.' }
  ];
  steps = [
    { n: 1, t: 'Get invited', d: 'You receive an invitation by email and activate your account.' },
    { n: 2, t: 'Report your work', d: 'On your report date, add one activity for each project you worked on.' },
    { n: 3, t: 'Get reviewed', d: 'Your manager reviews the report and gives feedback.' }
  ];
}
