import { Component, Input } from '@angular/core';
import { TPipe } from './t.pipe';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [IconComponent, TPipe],
  template: `
    <div class="stat" [class.stat-hl]="highlight">
      <span class="stat-ico"><app-icon [name]="icon" /></span>
      <div class="stat-label">{{ label | t }}</div>
      <div class="stat-value">{{ value }}</div>
      @if (sub) { <div class="stat-sub">{{ sub | t }}</div> }
    </div>`
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: string | number = 0;
  @Input() icon = 'info';
  @Input() sub = '';
  @Input() highlight = false;
}
