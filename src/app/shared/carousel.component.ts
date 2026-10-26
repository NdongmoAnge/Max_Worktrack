import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { SCREENS } from '../core/screens';
import { IconComponent } from './icon.component';
import { TPipe } from './t.pipe';

/** Screenshot carousel for the welcome page: auto-plays, pauses on hover/focus, arrows, dots, swipe and keyboard friendly. */
@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [TPipe, IconComponent],
  template: `
    <section class="car" aria-roledescription="carousel" [attr.aria-label]="'Screenshots of Max WorkTrack' | t"
             (mouseenter)="hold = true" (mouseleave)="hold = false" (focusin)="hold = true" (focusout)="hold = false"
             (keydown.arrowLeft)="prev()" (keydown.arrowRight)="next()">
      <div class="car-frame">
        <div class="car-bar"><i></i><i></i><i></i></div>
        <div class="car-viewport" (touchstart)="touchX = $event.changedTouches[0].clientX" (touchend)="swipe($event.changedTouches[0].clientX)">
          @for (s of slides; track s.title; let i = $index) {
            <figure class="car-slide" [class.on]="i === index()" [attr.aria-hidden]="i !== index()" role="group" [attr.aria-label]="(i + 1) + ' / ' + slides.length">
              <img [src]="s.src" [alt]="s.title | t" />
            </figure>
          }
          <button type="button" class="car-nav prev" (click)="prev()" [attr.aria-label]="'Previous slide' | t"><app-icon name="chevron-left" /></button>
          <button type="button" class="car-nav next" (click)="next()" [attr.aria-label]="'Next slide' | t"><app-icon name="chevron-right" /></button>
        </div>
      </div>
      <div class="car-caption" aria-live="polite">
        <h3>{{ slides[index()].title | t }}</h3>
        <p>{{ slides[index()].desc | t }}</p>
      </div>
      <div class="car-dots" role="tablist">
        @for (s of slides; track s.title; let i = $index) {
          <button type="button" role="tab" [class.on]="i === index()" [attr.aria-selected]="i === index()" [attr.aria-label]="s.title | t" (click)="go(i)"></button>
        }
      </div>
    </section>`
})
export class CarouselComponent implements OnInit, OnDestroy {
  slides = [
    { src: SCREENS[0], title: 'Clear dashboards', desc: 'Statistics, charts and recent activity at a glance.' },
    { src: SCREENS[1], title: 'Weekly report on several projects', desc: 'One activity per project, with fixed dates and the actual end date.' },
    { src: SCREENS[2], title: 'Report dates you control', desc: 'Choose the day each person must submit the weekly report.' },
    { src: SCREENS[3], title: 'Fast report reviews', desc: 'Approve, reject or request a correction, with a comment.' },
    { src: SCREENS[4], title: 'Project progress', desc: 'Follow progress, planned dates and delays.' }
  ];
  index = signal(0);
  hold = false;
  touchX = 0;
  private timer: any;

  ngOnInit() {
    const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) this.timer = setInterval(() => { if (!this.hold) this.next(); }, 5000);
  }
  ngOnDestroy() { clearInterval(this.timer); }

  go(i: number) { this.index.set((i + this.slides.length) % this.slides.length); }
  next() { this.go(this.index() + 1); }
  prev() { this.go(this.index() - 1); }
  swipe(x: number) { const d = x - this.touchX; if (Math.abs(d) > 40) d < 0 ? this.next() : this.prev(); }
}
