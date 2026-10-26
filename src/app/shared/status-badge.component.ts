import { Component, Input } from '@angular/core';
import { TPipe } from './t.pipe';


const MAP: Record<string, string> = {
  Active: 'ok', Completed: 'ok', Approved: 'ok', Accepted: 'ok', Submitted: 'ok', 'Open today': 'ok', 'Closed today': 'neutral',
  Pending: 'warn', 'Awaiting Review': 'warn', 'Needs Correction': 'warn', 'On Hold': 'warn', Paused: 'warn',
  Suspended: 'bad', Rejected: 'bad', Delayed: 'bad', Expired: 'bad', Revoked: 'bad', Cancelled: 'bad', Inactive: 'bad', Missing: 'bad',
  'In Progress': 'info', 'Not Started': 'neutral'
};

/** Always shows the status as text (never colour alone). */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [TPipe],
  template: `<span class="badge" [class]="'badge b-' + kind"><i class="dot"></i>{{ status | t }}</span>`
})
export class StatusBadgeComponent {
  @Input() status = '';
  get kind() { return MAP[this.status] ?? 'neutral'; }
}
