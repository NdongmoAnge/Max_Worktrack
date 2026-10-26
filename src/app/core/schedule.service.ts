import { Injectable, signal } from '@angular/core';
import { isoToday, nextReportDate } from './report-rules';

/** Report dates chosen by the branch manager, keyed by person name (sample storage; the back end will own this). */
@Injectable({ providedIn: 'root' })
export class ScheduleService {
  dates = signal<Record<string, string>>(this.load());

  private load(): Record<string, string> {
    try { return JSON.parse(localStorage.getItem('rms_schedule') || '{}'); } catch { return {}; }
  }
  private save() { try { localStorage.setItem('rms_schedule', JSON.stringify(this.dates())); } catch {} }

  /** The date the manager chose, or null when the default (Monday) applies. */
  anchor(name: string): string | null { return this.dates()[name] ?? null; }
  nextFor(name: string): string { return nextReportDate(this.anchor(name), isoToday()); }
  isOpenFor(name: string): boolean { return this.nextFor(name) === isoToday(); }

  set(names: string[], date: string) {
    this.dates.update(d => { const n = { ...d }; names.forEach(x => (n[x] = date)); return n; });
    this.save();
  }
  reset(names: string[]) {
    this.dates.update(d => { const n = { ...d }; names.forEach(x => delete n[x]); return n; });
    this.save();
  }
}
