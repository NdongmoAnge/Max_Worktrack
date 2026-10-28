import { Component, HostListener, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { SCREENS } from '../core/screens';
import { IconComponent } from './icon.component';
import { TPipe } from './t.pipe';

/** Screenshot carousel: slides by itself, progress bar, 3D tilt, swipe, dots, click to enlarge. */
@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [TPipe, IconComponent],
  template: `
    <section class="car" aria-roledescription="carousel" [attr.aria-label]="'Screenshots of Max WorkTrack' | t"
             (keydown.arrowLeft)="prev(true)" (keydown.arrowRight)="next(true)">
      <div class="car-frame" #frame (mousemove)="tilt($event, frame)" (mouseleave)="untilt(frame)">
        <div class="car-bar"><i></i><i></i><i></i><span class="car-url">max-worktrack</span></div>
        <div class="car-viewport" (touchstart)="touchX = $event.changedTouches[0].clientX" (touchend)="swipe($event.changedTouches[0].clientX)">
          <div class="car-track" [style.transform]="'translateX(-' + index() * 100 + '%)'">
            @for (s of slides; track s.title; let i = $index) {
              <figure class="car-slide" [attr.aria-hidden]="i !== index()" role="group" [attr.aria-label]="(i + 1) + ' / ' + slides.length">
                <img [src]="s.src" [alt]="s.title | t" draggable="false" (click)="zoom.set(true)" />
              </figure>
            }
          </div>
          <button type="button" class="car-nav prev" (click)="prev(true)" [attr.aria-label]="'Previous slide' | t"><app-icon name="chevron-left" /></button>
          <button type="button" class="car-nav next" (click)="next(true)" [attr.aria-label]="'Next slide' | t"><app-icon name="chevron-right" /></button>
          <span class="car-zoom"><app-icon name="eye" /> {{ 'Click to enlarge' | t }}</span>
        </div>
        <div class="car-progress" [class.paused]="zoom()" aria-hidden="true">
          @for (k of progressKey(); track k) { <i [style.animation-duration.ms]="delay"></i> }
        </div>
      </div>
      <div class="car-caption" aria-live="polite">
        <h3>{{ slides[index()].title | t }}</h3>
        <p>{{ slides[index()].desc | t }}</p>
      </div>
      <div class="car-dots" role="tablist">
        @for (s of slides; track s.title; let i = $index) {
          <button type="button" role="tab" [class.on]="i === index()" [attr.aria-selected]="i === index()" [attr.aria-label]="s.title | t" (click)="go(i, true)"></button>
        }
      </div>

      @if (zoom()) {
        <div class="car-lightbox" role="dialog" aria-modal="true" (click)="zoom.set(false)">
          <img [src]="slides[index()].src" [alt]="slides[index()].title | t" (click)="$event.stopPropagation()" />
          <button type="button" class="lb-btn close" (click)="zoom.set(false)" [attr.aria-label]="'Close' | t"><app-icon name="x" /></button>
          <button type="button" class="lb-btn prev" (click)="prev(true); $event.stopPropagation()" [attr.aria-label]="'Previous slide' | t"><app-icon name="chevron-left" /></button>
          <button type="button" class="lb-btn next" (click)="next(true); $event.stopPropagation()" [attr.aria-label]="'Next slide' | t"><app-icon name="chevron-right" /></button>
          <p class="lb-cap" (click)="$event.stopPropagation()">{{ slides[index()].title | t }}</p>
        </div>
      }
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
  zoom = signal(false);
  progressKey = computed(() => [this.index()]);
  delay = 4000;
  touchX = 0;
  private timer: any;

  ngOnInit() { this.restart(); }
  ngOnDestroy() { clearInterval(this.timer); }

  /** Slides on its own; manual moves restart the timer. */
  private restart() {
    clearInterval(this.timer);
    this.timer = setInterval(() => { if (!this.zoom() && !document.hidden) this.next(false); }, this.delay);
  }
  go(i: number, manual = false) { this.index.set((i + this.slides.length) % this.slides.length); if (manual) this.restart(); }
  next(manual = false) { this.go(this.index() + 1, manual); }
  prev(manual = false) { this.go(this.index() - 1, manual); }
  swipe(x: number) { const d = x - this.touchX; if (Math.abs(d) > 40) d < 0 ? this.next(true) : this.prev(true); }

  tilt(e: MouseEvent, el: HTMLElement) {
    if (typeof matchMedia === 'function' && matchMedia('(hover: none)').matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = 'perspective(1000px) rotateY(' + x * 6 + 'deg) rotateX(' + -y * 5 + 'deg)';
  }
  untilt(el: HTMLElement) { el.style.transform = ''; }

  @HostListener('document:keydown.escape') onEsc() { this.zoom.set(false); }
}
