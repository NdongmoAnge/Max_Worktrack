import { Component, inject } from '@angular/core';
import { ToastService } from '../core/toast.service';
import { TPipe } from './t.pipe';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [IconComponent, TPipe],
  template: `
    <div class="toasts" aria-live="polite">
      @for (t of toast.toasts(); track t.id) {
        <div [class]="'toast t-' + t.type" role="status">
          <app-icon [name]="icon(t.type)" />
          <span>{{ t.message | t }}</span>
          <button type="button" (click)="toast.dismiss(t.id)" [attr.aria-label]="'Dismiss message' | t"><app-icon name="x" /></button>
        </div>
      }
    </div>`
})
export class ToastContainerComponent {
  toast = inject(ToastService);
  icon(t: string) { return t === 'success' ? 'check' : t === 'error' ? 'x' : t === 'warning' ? 'alert' : 'info'; }
}
