import { Component, Input } from '@angular/core';
import { TPipe } from './t.pipe';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IconComponent, TPipe],
  template: `<div class="empty"><app-icon [name]="icon" /><p>{{ message | t }}</p></div>`
})
export class EmptyStateComponent {
  @Input() message = 'Nothing to show yet.';
  @Input() icon = 'folder';
}
