import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-area-chart',
  standalone: true,
  template: `
    <svg viewBox="0 0 520 190" class="area-svg" role="img" [attr.aria-label]="summary">
      <defs>
        <linearGradient id="agrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0a0af0" stop-opacity="0.55" />
          <stop offset="100%" stop-color="#0a0af0" stop-opacity="0.02" />
        </linearGradient>
      </defs>
      @for (g of grid; track g) { <line x1="24" x2="496" [attr.y1]="g" [attr.y2]="g" stroke="#e3e3ea" /> }
      <path [attr.d]="area" fill="url(#agrad)" />
      <path [attr.d]="line" fill="none" stroke="#0a0af0" stroke-width="2.5" />
      @for (p of dots; track $index) { <circle [attr.cx]="p[0]" [attr.cy]="p[1]" r="3.5" fill="#ffffff" stroke="#0a0af0" stroke-width="2" /> }
      @for (l of lbls; track l.t) { <text [attr.x]="l.x" y="184" text-anchor="middle" font-size="11" fill="#6b7280">{{ l.t }}</text> }
    </svg>`
})
export class AreaChartComponent implements OnChanges {
  @Input() data: number[] = [];
  @Input() labels: string[] = [];
  line = ''; area = ''; summary = ''; grid = [20, 70, 120, 150];
  dots: number[][] = []; lbls: { t: string; x: number }[] = [];

  ngOnChanges() {
    const w = 520, h = 190, padX = 24, top = 20, bottom = 150;
    const n = this.data.length;
    if (!n) { return; }
    const max = Math.max(...this.data, 1);
    const xs = (i: number) => padX + (i * (w - 2 * padX)) / Math.max(n - 1, 1);
    const ys = (v: number) => bottom - (v / max) * (bottom - top);
    const pts = this.data.map((v, i) => [xs(i), ys(v)]);
    let d = 'M' + pts[0][0] + ',' + pts[0][1];
    for (let i = 1; i < n; i++) {
      const cx = (pts[i - 1][0] + pts[i][0]) / 2;
      d += ' C' + cx + ',' + pts[i - 1][1] + ' ' + cx + ',' + pts[i][1] + ' ' + pts[i][0] + ',' + pts[i][1];
    }
    this.line = d;
    this.area = d + ' L' + pts[n - 1][0] + ',' + bottom + ' L' + pts[0][0] + ',' + bottom + ' Z';
    this.dots = pts;
    this.lbls = this.labels.map((t, i) => ({ t, x: xs(i) }));
    this.summary = 'Chart of ' + this.labels.join(', ') + ': ' + this.data.join(', ');
    void h;
  }
}
