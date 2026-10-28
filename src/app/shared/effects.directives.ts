import { Directive, ElementRef, Input, OnDestroy, OnInit, inject } from '@angular/core';

/** Fades/slides an element in when it scrolls into view. Usage: <div reveal="120"> (optional delay in ms). */
@Directive({ selector: '[reveal]', standalone: true })
export class RevealDirective implements OnInit, OnDestroy {
  @Input() reveal: string | number = 0;
  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private io?: IntersectionObserver;

  ngOnInit() {
    const n = this.el.nativeElement;
    n.classList.add('reveal');
    n.style.transitionDelay = (Number(this.reveal) || 0) + 'ms';
    if (typeof IntersectionObserver === 'undefined') { n.classList.add('in'); return; }
    this.io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { n.classList.add('in'); this.io?.disconnect(); }
    }, { threshold: 0.15 });
    this.io.observe(n);
  }
  ngOnDestroy() { this.io?.disconnect(); }
}

/** 3D tilt + moving glow that follows the mouse. */
@Directive({ selector: '[tilt]', standalone: true, host: { '(mousemove)': 'move($event)', '(mouseleave)': 'leave()' } })
export class TiltDirective {
  private el = inject<ElementRef<HTMLElement>>(ElementRef);

  move(e: MouseEvent) {
    const n = this.el.nativeElement;
    const r = n.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    n.style.setProperty('--mx', x * 100 + '%');
    n.style.setProperty('--my', y * 100 + '%');
    n.style.transform = 'perspective(700px) rotateX(' + (0.5 - y) * 8 + 'deg) rotateY(' + (x - 0.5) * 10 + 'deg) translateY(-6px)';
  }
  leave() { this.el.nativeElement.style.transform = ''; }
}
