import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { ScheduleService } from './schedule.service';

/** Is the reporting period open for the logged-in person? The date is chosen by their branch manager (default Monday). */
@Injectable({ providedIn: 'root' })
export class ReportingService {
  private auth = inject(AuthService);
  private schedule = inject(ScheduleService);
  private override = signal<boolean | null>(null); // demo switch only

  open(): boolean { return this.override() ?? this.schedule.isOpenFor(this.auth.fullName()); }
  nextDate(): string { return this.schedule.nextFor(this.auth.fullName()); }
  toggle() { this.override.set(!this.open()); }
}
