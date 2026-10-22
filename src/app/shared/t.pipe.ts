import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from '../core/i18n.service';

/** {{ 'English text' | t }}  or  {{ 'Hello {name}' | t: { name: x } }}. Impure so it updates on language change. */
@Pipe({ name: 't', standalone: true, pure: false })
export class TPipe implements PipeTransform {
  private i18n = inject(I18nService);
  transform(value: any, params?: Record<string, any>): string {
    if (value === null || value === undefined) return '';
    return this.i18n.t(String(value), params);
  }
}
