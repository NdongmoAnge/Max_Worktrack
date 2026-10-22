import { Component, HostListener, inject } from '@angular/core';
import { TPipe } from './t.pipe';
import { ConfirmService } from '../core/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [TPipe],
  template: `
    @if (c.state(); as s) {
      <div class="modal-backdrop" (click)="c.answer(false)">
        <div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="dlg-title" (click)="$event.stopPropagation()">
          <h3 id="dlg-title">{{ s.title | t }}</h3>
          <p>{{ s.message | t }}</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" (click)="c.answer(false)">{{ 'Cancel' | t }}</button>
            <button type="button" class="btn" [class.btn-danger]="s.danger" [class.btn-primary]="!s.danger" (click)="c.answer(true)">{{ s.confirmLabel || 'Confirm' | t }}</button>
          </div>
        </div>
      </div>
    }`
})
export class ConfirmDialogComponent {
  c = inject(ConfirmService);
  @HostListener('document:keydown.escape') onEsc() { if (this.c.state()) this.c.answer(false); }
}
