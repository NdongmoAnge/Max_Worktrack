import { Component, inject, signal } from '@angular/core';
import { ToastService } from '../core/toast.service';
import { LOGO } from '../core/brand';
import { TPipe } from './t.pipe';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [TPipe],
  template: `
    <footer class="site-footer">
      <div class="sf-wrap">
        <div class="sf-grid">
          <div class="sf-brand">
            <img [src]="logo" alt="Max WorkTrack" />
            <p>{{ 'Providing a simple way to follow work, reports and projects in every team.' | t }}</p>
          </div>
          <nav class="sf-col" [attr.aria-label]="'Company' | t">
            <h4>{{ 'Company' | t }}</h4>
            <a href="#" (click)="soon($event)">{{ 'About us' | t }}</a>
            <a href="#" (click)="soon($event)">{{ 'Maxwell Technologies' | t }}</a>
            <a href="#" (click)="soon($event)">{{ 'Contact' | t }}</a>
          </nav>
          <nav class="sf-col" [attr.aria-label]="'Resources' | t">
            <h4>{{ 'Resources' | t }}</h4>
            <a href="#" (click)="soon($event)">{{ 'User guide' | t }}</a>
            <a href="#" (click)="soon($event)">{{ 'Weekly report guide' | t }}</a>
            <a href="#" (click)="soon($event)">{{ 'Help and support' | t }}</a>
          </nav>
          <nav class="sf-col" [attr.aria-label]="'Social Media' | t">
            <h4>{{ 'Social Media' | t }}</h4>
            <a href="https://www.facebook.com" target="_blank" rel="noopener">Facebook</a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener">Instagram</a>
            <a href="https://www.linkedin.com" target="_blank" rel="noopener">LinkedIn</a>
          </nav>
          <div class="sf-news">
            <h4>{{ 'Newsletter' | t }}</h4>
            <p>{{ 'Subscribe to our newsletter and stay up to date about the platform.' | t }}</p>
            <form class="sf-form" (submit)="subscribe($event, em)" novalidate>
              <input #em type="email" [placeholder]="'Email address' | t" [attr.aria-label]="'Email address' | t" />
              <button type="submit">{{ 'Subscribe' | t }}</button>
            </form>
            @if (err()) { <small class="error" role="alert">{{ err() | t }}</small> }
          </div>
        </div>
        <div class="sf-bottom">
          <span>© 2026 Maxwell Technologies. {{ 'All rights reserved.' | t }}</span>
          <span class="sf-links">
            <a href="#" (click)="soon($event)">{{ 'Terms' | t }}</a>
            <a href="#" (click)="soon($event)">{{ 'Privacy Policy' | t }}</a>
          </span>
        </div>
      </div>
    </footer>`
})
export class SiteFooterComponent {
  private toast = inject(ToastService);
  logo = LOGO;
  err = signal('');

  soon(e: Event) { e.preventDefault(); this.toast.info('This page is coming soon.'); }
  subscribe(e: Event, input: HTMLInputElement) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) { this.err.set('Please enter a valid email address.'); return; }
    this.err.set('');
    input.value = '';
    this.toast.success('Thank you for subscribing.');
  }
}
