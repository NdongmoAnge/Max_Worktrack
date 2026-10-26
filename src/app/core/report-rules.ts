/** Local date as YYYY-MM-DD. */
export function isoToday(): string {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/** Sunday (end of the Monday-Sunday week) of the week containing the given YYYY-MM-DD date. */
export function weekEnd(dateStr: string): Date {
  const d = new Date(dateStr + 'T00:00:00');
  const dow = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() + (6 - dow));
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * A report can be edited by its owner only during the week it was submitted.
 * Once that week is over it is locked. (The back end must enforce the same rule.)
 */
export function canEditReport(r: any, owner?: string): boolean {
  if (!r || !r.submittedAt) return false;
  if (owner && r.employee !== owner) return false;
  return new Date() <= weekEnd(r.submittedAt);
}

export function editDeadline(r: any, locale: string): string {
  return weekEnd(r.submittedAt).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
}

export interface ReportEntry { project: string; projectId: string; description: string; startDate: string; endDate: string; actualEndDate: string; activityStatus: string; }

/** A weekly report holds one activity per project. These fields are derived from the entries for lists and summaries. */
export function summarizeEntries(entries: ReportEntry[]) {
  const names = entries.map(e => e.project);
  const statuses = Array.from(new Set(entries.map(e => e.activityStatus)));
  const starts = entries.map(e => e.startDate).filter(Boolean).sort();
  const ends = entries.map(e => e.endDate).filter(Boolean).sort();
  return {
    projects: names,
    project: names.join(', '),
    projectId: entries[0]?.projectId ?? '',
    activityStatus: statuses.length === 1 ? statuses[0] : 'In Progress',
    startDate: starts[0] ?? '',
    endDate: ends[ends.length - 1] ?? ''
  };
}

export function toIso(d: Date): string {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/**
 * The branch manager chooses a report date for each employee. That date then repeats every week
 * (same weekday). With no date chosen the default is Monday. Returns the next report day on or after `today`.
 */
export function nextReportDate(anchor: string | null, today: string): string {
  const t = new Date(today + 'T00:00:00');
  if (!anchor) {
    const d = new Date(t);
    d.setDate(t.getDate() + ((8 - t.getDay()) % 7)); // next Monday (or today if Monday)
    return toIso(d);
  }
  const a = new Date(anchor + 'T00:00:00');
  if (t <= a) return anchor;
  const diff = Math.round((t.getTime() - a.getTime()) / 86400000);
  const d = new Date(a);
  d.setDate(a.getDate() + 7 * Math.ceil(diff / 7));
  return toIso(d);
}
