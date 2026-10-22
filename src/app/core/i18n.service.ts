import { Injectable, signal } from '@angular/core';
import { FR } from './i18n-fr';

export type Lang = 'en' | 'fr';

/** Tiny translation service. English text is the key; French comes from i18n-fr.ts. */
@Injectable({ providedIn: 'root' })
export class I18nService {
  lang = signal<Lang>(this.initial());

  constructor() { document.documentElement.lang = this.lang(); }

  get locale(): string { return this.lang() === 'fr' ? 'fr-FR' : 'en-GB'; }

  private initial(): Lang {
    try {
      const s = localStorage.getItem('rms_lang');
      if (s === 'fr' || s === 'en') return s;
    } catch {}
    return (navigator.language || 'en').toLowerCase().startsWith('fr') ? 'fr' : 'en';
  }

  set(l: Lang) {
    this.lang.set(l);
    document.documentElement.lang = l;
    try { localStorage.setItem('rms_lang', l); } catch {}
  }

  t(key: string, params?: Record<string, any>): string {
    let s = this.lang() === 'fr' ? (FR[key] ?? key) : key;
    if (params) for (const k of Object.keys(params)) s = s.split('{' + k + '}').join(String(params[k]));
    return s;
  }
}
