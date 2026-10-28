import { Injectable, signal } from '@angular/core';
import { FR } from './i18n-fr';

export type Lang = 'en' | 'fr';

/** Tiny translation service. English text is the key; French comes from i18n-fr.ts. */
@Injectable({ providedIn: 'root' })
export class I18nService {
  lang = signal<Lang>(this.initial());
  /** 'default' = follow the company's default language chosen by the Super Admin. */
  pref = signal<'default' | Lang>('default');
  private userKey: string | null = null;
  private companyDefault: Lang | null = null;

  constructor() { document.documentElement.lang = this.lang(); }

  get locale(): string { return this.lang() === 'fr' ? 'fr-FR' : 'en-GB'; }

  private key() { return 'rms_lang_' + (this.userKey ?? 'visitor'); }
  /** The website language follows the browser language. */
  private browserLang(): Lang {
    const l = String((navigator.languages && navigator.languages[0]) || navigator.language || 'en').toLowerCase();
    return l.startsWith('fr') ? 'fr' : 'en';
  }
  private initial(): Lang {
    try { const s = sessionStorage.getItem('rms_lang_visitor'); if (s === 'fr' || s === 'en') return s; } catch {}
    return this.browserLang();
  }
  private apply(l: Lang) { this.lang.set(l); document.documentElement.lang = l; }

  /** Called on login / logout. A language the person chose themselves wins; otherwise the enterprise default applies. */
  setUser(email: string | null, companyDefault: Lang | null = null) {
    this.userKey = email;
    this.companyDefault = companyDefault;
    if (!email) { this.pref.set('default'); this.apply(this.initial()); return; }
    let saved: string | null = null;
    try { saved = localStorage.getItem(this.key()); } catch {}
    if (saved === 'fr' || saved === 'en') { this.pref.set(saved); this.apply(saved); }
    else { this.pref.set('default'); if (companyDefault) this.apply(companyDefault); }
  }

  /** The person's own choice (EN | FR switch or Profile Settings). */
  set(l: Lang) {
    this.apply(l); this.pref.set(l);
    try { (this.userKey ? localStorage : sessionStorage).setItem(this.key(), l); } catch {}
  }
  /** Forget the personal choice and follow the company default again. */
  setDefaultPreference() {
    try { localStorage.removeItem(this.key()); } catch {}
    this.pref.set('default');
    this.apply(this.companyDefault ?? this.initial());
  }

  t(key: string, params?: Record<string, any>): string {
    let s = this.lang() === 'fr' ? (FR[key] ?? key) : key;
    if (params) for (const k of Object.keys(params)) s = s.split('{' + k + '}').join(String(params[k]));
    return s;
  }
}
