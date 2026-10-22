import { Component, inject } from '@angular/core';
import { I18nService } from '../core/i18n.service';
import { TPipe } from './t.pipe';

@Component({
  selector: 'app-lang-switch',
  standalone: true,
  imports: [TPipe],
  template: `
    <div class="lang-switch" role="group" [attr.aria-label]="'Language' | t">
      <button type="button" [class.on]="i18n.lang() === 'en'" [attr.aria-pressed]="i18n.lang() === 'en'" (click)="i18n.set('en')" title="English">EN</button>
      <button type="button" [class.on]="i18n.lang() === 'fr'" [attr.aria-pressed]="i18n.lang() === 'fr'" (click)="i18n.set('fr')" title="Français">FR</button>
    </div>`
})
export class LangSwitchComponent {
  i18n = inject(I18nService);
}
