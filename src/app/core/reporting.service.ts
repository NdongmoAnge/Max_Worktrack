import { Injectable, signal } from '@angular/core';

/** Front-end stand-in for the back end's "is the reporting period open?" answer (Monday only). */
@Injectable({ providedIn: 'root' })
export class ReportingService {
  open = signal(new Date().getDay() === 1);
  toggle() { this.open.update(v => !v); }
}
