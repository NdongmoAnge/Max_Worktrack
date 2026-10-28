import { Component, HostListener, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { LOGO_DARK } from '../core/brand';
import { IconComponent } from '../shared/icon.component';
import { LangSwitchComponent } from '../shared/lang-switch.component';
import { CarouselComponent } from '../shared/carousel.component';
import { SiteFooterComponent } from '../shared/site-footer.component';
import { RevealDirective, TiltDirective } from '../shared/effects.directives';
import { TPipe } from '../shared/t.pipe';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [TPipe, RouterLink, IconComponent, LangSwitchComponent, CarouselComponent, SiteFooterComponent, RevealDirective, TiltDirective],
  template: `
    <div class="wl">
      <header class="wl-nav-bar" [class.scrolled]="scrolled()">
        <div class="wl-wrap wl-nav">
          <img [src]="logo" alt="Max WorkTrack" />
          <nav class="wl-links" [attr.aria-label]="'Main navigation' | t">
            <a href="#features" (click)="go($event, 'features')">{{ 'Features' | t }}</a>
            <a href="#screens" (click)="go($event, 'screens')">{{ 'Screenshots' | t }}</a>
            <a href="#how" (click)="go($event, 'how')">{{ 'How it works' | t }}</a>
          </nav>
          <div class="wl-nav-actions">
            <app-lang-switch />
            @if (auth.user()) {
              <a class="btn btn-light" [routerLink]="[auth.base(), 'dashboard']">{{ 'Go to my dashboard' | t }}</a>
            } @else {
              <a class="btn btn-light" routerLink="/login">{{ 'Sign in' | t }}</a>
            }
          </div>
        </div>
      </header>

      <section class="wl-hero" #hero (mousemove)="onMove($event, hero)">
        <span class="wl-orb a"></span><span class="wl-orb b"></span><span class="wl-orb c"></span>
        <div class="wl-wrap">
          <div class="wl-grid">
            <div class="wl-copy">
              <span class="wl-pill"><app-icon name="activity" /> {{ 'Report and project management' | t }}</span>
              <h1><span>{{ 'Track work.' | t }}</span> <span class="grad">{{ 'Review reports.' | t }}</span> <span>{{ 'Deliver projects.' | t }}</span></h1>
              <p class="wl-rotate" aria-live="polite">@for (p of phraseList(); track p) { <span class="rot">{{ p | t }}</span> }</p>
              <p>{{ 'Max WorkTrack helps enterprises manage projects, teams and weekly activity reports in one place.' | t }}</p>
              <div class="wl-cta">
                @if (auth.user()) {
                  <a class="btn btn-light btn-lg pulse" [routerLink]="[auth.base(), 'dashboard']">{{ 'Go to my dashboard' | t }} <app-icon name="chevron-right" /></a>
                } @else {
                  <a class="btn btn-light btn-lg pulse" routerLink="/login">{{ 'Sign in' | t }} <app-icon name="chevron-right" /></a>
                }
              </div>
            </div>

            <div class="wl-visual" id="screens">
              <app-carousel />
              <div class="float-card f1" aria-hidden="true"><app-icon name="check" /> {{ 'Report approved' | t }}</div>
              <div class="float-card f2" aria-hidden="true"><app-icon name="folder" /> {{ '3 projects this week' | t }}</div>
              <div class="float-card f3" aria-hidden="true"><app-icon name="mail" /> {{ 'Invitation sent' | t }}</div>
            </div>
          </div>
        </div>
      </section>

      <div class="wl-marquee" aria-hidden="true">
        <div class="wl-marquee-track">
          @for (r of [1, 2]; track r) { @for (m of marquee; track m) { <span>✦ {{ m | t }}</span> } }
        </div>
      </div>

      <section class="wl-section" id="features">
        <div class="wl-wrap">
          <div class="wl-head" reveal><h2>{{ 'Everything your team needs' | t }}</h2><p>{{ 'One simple platform for reports, projects and people.' | t }}</p></div>
          <div class="wl-features">
            @for (f of features; track f.t; let i = $index) {
              <div [reveal]="i * 90">
                <article class="wl-feature" tilt>
                  <span class="wl-ico"><app-icon [name]="f.icon" /></span>
                  <h3>{{ f.t | t }}</h3>
                  <p>{{ f.d | t }}</p>
                </article>
              </div>
            }
          </div>
        </div>
      </section>

      <section class="wl-section alt" id="how">
        <div class="wl-wrap">
          <div class="wl-head" reveal><h2>{{ 'How it works' | t }}</h2></div>
          <div class="wl-steps">
            @for (s of steps; track s.n; let i = $index) {
              <div class="wl-step" [reveal]="i * 140"><span class="wl-num">{{ s.n }}</span><h3>{{ s.t | t }}</h3><p>{{ s.d | t }}</p></div>
            }
          </div>
        </div>
      </section>

      <section class="wl-cta-band">
        <span class="wl-orb a"></span><span class="wl-orb b"></span>
        <div class="wl-wrap" reveal>
          <h2>{{ 'Ready to get started?' | t }}</h2>
          <p>{{ 'Sign in to your workspace or activate the account you were invited to.' | t }}</p>
          <div class="wl-cta center-cta">
            @if (auth.user()) {
              <a class="btn btn-light btn-lg" [routerLink]="[auth.base(), 'dashboard']">{{ 'Go to my dashboard' | t }}</a>
            } @else {
              <a class="btn btn-light btn-lg" routerLink="/login">{{ 'Sign in' | t }}</a>
            }
          </div>
        </div>
      </section>

      <app-site-footer />

      @if (showTop()) {
        <button type="button" class="to-top" (click)="top()" [attr.aria-label]="'Back to top' | t"><app-icon name="chevron-down" /></button>
      }
    </div>`
})
export class WelcomeComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  logo = LOGO_DARK;
  scrolled = signal(false);
  showTop = signal(false);
  private pi = signal(0);
  private phrases = ['Simplify your weekly reports.', 'Simplify your project tracking.', 'Simplify your report reviews.', 'Simplify your team activity.'];
  phraseList = computed(() => [this.phrases[this.pi()]]);
  private timer: any;

  marquee = ['Weekly reports', 'Projects', 'Reviews', 'Invitations', 'Dashboards', 'Report dates', 'Progress tracking', 'English and French'];
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

  ngOnInit() { this.timer = setInterval(() => this.pi.update(i => (i + 1) % this.phrases.length), 2800); }
  ngOnDestroy() { clearInterval(this.timer); }

  @HostListener('window:scroll') onScroll() {
    const y = window.scrollY;
    this.scrolled.set(y > 30);
    this.showTop.set(y > 600);
  }
  /** Spotlight + parallax that follow the mouse in the header. */
  onMove(e: MouseEvent, el: HTMLElement) {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--gx', x * 100 + '%');
    el.style.setProperty('--gy', y * 100 + '%');
    el.style.setProperty('--px', String((x - 0.5) * 2));
    el.style.setProperty('--py', String((y - 0.5) * 2));
  }
  go(e: Event, id: string) { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  top() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
}
