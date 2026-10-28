import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ConfirmService } from '../core/confirm.service';
import { ToastService } from '../core/toast.service';
import { ReportingService } from '../core/reporting.service';
import { I18nService } from '../core/i18n.service';
import { PROJECTS, REPORTS, saveProjects } from '../core/mock-data';
import { TASK_STATUSES, canEditReport, editDeadline, isoToday, summarizeEntries, toIso, worstStatus } from '../core/report-rules';
import { PageHeaderComponent } from '../shared/page-header.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { IconComponent } from '../shared/icon.component';
import { TPipe } from '../shared/t.pipe';

interface TNode { id: string; title: string; subtasks: { id: string; title: string }[]; }
interface PView { id: string; name: string; progress: number; tasks: TNode[]; }
interface Errs { global: string; proj: Record<string, { actual?: string; desc?: string }>; notes: Record<string, string>; }

/**
 * Weekly report: the employee's projects are collapsible groups; each project shows its tasks and subtasks and the
 * employee gives every task (or subtask) a status: In Progress, Almost Done, Paused or Blocked.
 */
@Component({
  selector: 'app-weekly-report',
  standalone: true,
  imports: [TPipe, NgTemplateOutlet, PageHeaderComponent, EmptyStateComponent, IconComponent],
  template: `
    @if (!locked) {
      <app-page-header [title]="edit ? 'Edit Weekly Report' : 'Submit Weekly Report'" [crumbs]="['Reports', edit ? 'Edit' : 'Submit']" />

      @if (edit) {
        <div class="alert alert-info" role="status"><app-icon name="info" /> {{ 'You can edit this report until {date}.' | t: { date: deadline } }} {{ 'Editing a report sends it back for review.' | t }}</div>
      } @else {
        @if (closed) {
          <div class="alert alert-warning" role="status"><app-icon name="alert" /> {{ 'Weekly report submission is currently closed. Your next report date is {date}.' | t: { date: nextDateLabel } }}</div>
        } @else {
          <div class="alert alert-info" role="status"><app-icon name="info" /> {{ 'The reporting period is open. You can submit your weekly report now.' | t }}</div>
        }
        <button type="button" class="link demo-toggle" (click)="reporting.toggle()">{{ (reporting.open() ? 'Demo: simulate closed reporting period' : 'Demo: simulate open reporting period') | t }}</button>
      }

      <div class="card form-card wr">
        <div class="wr-top">
          <div class="field wr-name"><label for="wr-emp">{{ 'Employee Name' | t }}</label><input id="wr-emp" [value]="auth.fullName()" readonly /></div>
          <div class="wr-summary" aria-live="polite">
            <span class="pill-count"><b>{{ projectsUpdated() }}</b> {{ 'projects updated' | t }}</span>
            <span class="pill-count"><b>{{ totalUpdated() }}</b> {{ 'tasks updated' | t }}</span>
          </div>
        </div>

        @if (projects.length) {
          <div class="wr-tools">
            <label class="search-box">
              <app-icon name="search" />
              <input type="search" [placeholder]="'Search projects...' | t" [attr.aria-label]="'Search projects...' | t" (input)="q.set($any($event.target).value)" />
            </label>
            <button type="button" class="chip" [class.on]="only()" [attr.aria-pressed]="only()" (click)="only.set(!only())">@if (only()) { <app-icon name="check" /> }{{ 'Show updated only' | t }}</button>
            <button type="button" class="btn btn-sm btn-outline" (click)="expandAll()">{{ 'Expand all' | t }}</button>
            <button type="button" class="btn btn-sm btn-outline" (click)="collapseAll()">{{ 'Collapse all' | t }}</button>
          </div>
          @if (errors().global) { <div class="alert alert-warning" role="alert"><app-icon name="alert" /> {{ errors().global }}</div> }

          <div class="proj-list">
            @for (p of visible(); track p.id) {
              <article class="proj" [class.open]="isOpen(p.id)" [class.has-err]="projErr(p)">
                <button type="button" class="proj-head" (click)="toggle(p.id)" [attr.aria-expanded]="isOpen(p.id)">
                  <span class="proj-name"><strong>{{ p.name | t }}</strong><small>{{ p.id }}</small></span>
                  <span class="proj-meta">
                    <span class="count" [class.has]="updated(p) > 0">{{ updated(p) }}/{{ total(p) }} {{ 'updated' | t }}</span>
                    <span class="pct">{{ p.progress }}%</span>
                    <span class="chev"><app-icon name="chevron-down" /></span>
                  </span>
                </button>
                @if (isOpen(p.id)) {
                  <div class="proj-body">
                    @if (p.tasks.length === 0) {
                      <p class="muted">{{ 'No tasks are assigned to you in this project.' | t }}</p>
                    } @else {
                      <ul class="wr-tasks">
                        @for (tk of p.tasks; track tk.id) {
                          <li class="wr-task">
                            <ng-container [ngTemplateOutlet]="line" [ngTemplateOutletContext]="{ $implicit: tk, small: false }" />
                            @if (tk.subtasks.length) {
                              <ul class="wr-subs">
                                @for (s of tk.subtasks; track s.id) {
                                  <li><span class="sub-dot"></span><div class="sub-line"><ng-container [ngTemplateOutlet]="line" [ngTemplateOutletContext]="{ $implicit: s, small: true }" /></div></li>
                                }
                              </ul>
                            }
                          </li>
                        }
                      </ul>
                      @if (updated(p) > 0) {
                        <div class="proj-summary form-grid">
                          <div class="field"><label>{{ 'Start Date' | t }}</label><input type="date" class="locked" [value]="range[p.id].start" disabled /></div>
                          <div class="field"><label>{{ 'End Date' | t }}</label><input type="date" class="locked" [value]="range[p.id].end" disabled /><small class="hint">{{ 'Start and end dates are set by the system for this reporting period.' | t }}</small></div>
                          <div class="field">
                            <label [attr.for]="'a-' + p.id">{{ 'Actual End Date' | t }} <span class="req" aria-hidden="true">*</span></label>
                            <input [id]="'a-' + p.id" type="date" [value]="actual()[p.id] || ''" [min]="range[p.id].start" [max]="today" (input)="setActual(p.id, $any($event.target).value)" />
                            @if (errors().proj[p.id]?.actual) { <small class="error" role="alert">{{ errors().proj[p.id].actual }}</small> }
                          </div>
                          <div class="field full">
                            <label [attr.for]="'d-' + p.id">{{ 'Change Description' | t }} <span class="req" aria-hidden="true">*</span></label>
                            <textarea [id]="'d-' + p.id" rows="3" [value]="desc()[p.id] || ''" (input)="setDesc(p.id, $any($event.target).value)" [placeholder]="'Describe what you did this week...' | t"></textarea>
                            @if (errors().proj[p.id]?.desc) { <small class="error" role="alert">{{ errors().proj[p.id].desc }}</small> }
                          </div>
                        </div>
                      } @else {
                        <p class="muted hintline">{{ 'Choose a status on a task to include this project in the report.' | t }}</p>
                      }
                    }
                  </div>
                }
              </article>
            } @empty { <app-empty-state message="No projects match your search." icon="folder" /> }
          </div>
        } @else {
          <app-empty-state message="No projects have been assigned to you yet." icon="folder" />
        }

        <div class="form-actions">
          <button type="button" class="btn btn-outline" (click)="cancel()">{{ 'Cancel' | t }}</button>
          <button type="button" class="btn btn-primary" [disabled]="submitting() || closed || !projects.length" (click)="submit()">
            @if (submitting()) { <span class="spinner spinner-light"></span> {{ 'Saving...' | t }} } @else { {{ (edit ? 'Save changes' : 'Submit Report') | t }} }
          </button>
        </div>
      </div>

      <ng-template #line let-it let-small="small">
        <div class="line" [class.small]="small">
          <span class="line-title">{{ it.title }}</span>
          <div class="seg" role="radiogroup" [attr.aria-label]="it.title">
            @for (s of statuses; track s) {
              <button type="button" class="seg-btn" [attr.data-s]="s" [class.on]="status()[it.id] === s" role="radio" [attr.aria-checked]="status()[it.id] === s" (click)="setStatus(it.id, s)">{{ s | t }}</button>
            }
          </div>
        </div>
        @if (status()[it.id] === 'Blocked' || status()[it.id] === 'Paused') {
          <div class="line-note">
            <input class="note-input" [value]="note()[it.id] || ''" (input)="setNote(it.id, $any($event.target).value)"
                   [placeholder]="(status()[it.id] === 'Blocked' ? 'What is blocking this task?' : 'Why is it paused? (optional)') | t"
                   [attr.aria-label]="(status()[it.id] === 'Blocked' ? 'What is blocking this task?' : 'Why is it paused? (optional)') | t" />
            @if (errors().notes[it.id]) { <small class="error" role="alert">{{ errors().notes[it.id] }}</small> }
          </div>
        }
      </ng-template>
    }`
})
export class WeeklyReportComponent implements OnInit {
  auth = inject(AuthService);
  reporting = inject(ReportingService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);
  private i18n = inject(I18nService);

  statuses = TASK_STATUSES;
  today = isoToday();
  private periodEnd = isoToday();
  private periodStart = toIso(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 6));

  edit = false;
  locked = false;
  record: any = null;
  projects: PView[] = [];
  range: Record<string, { start: string; end: string }> = {};
  private kept: any[] = [];

  status = signal<Record<string, string>>({});
  note = signal<Record<string, string>>({});
  actual = signal<Record<string, string>>({});
  desc = signal<Record<string, string>>({});
  open = signal<Set<string>>(new Set());
  q = signal('');
  only = signal(false);
  submitted = signal(false);
  submitting = signal(false);
  private dirty = false;

  get closed() { return !this.edit && !this.reporting.open(); }
  get nextDateLabel() { return new Date(this.reporting.nextDate() + 'T00:00:00').toLocaleDateString(this.i18n.locale, { weekday: 'long', day: 'numeric', month: 'long' }); }
  get deadline() { return this.record ? editDeadline(this.record, this.i18n.locale) : ''; }

  visible = computed(() => {
    const q = this.q().toLowerCase().trim();
    const st = this.status();
    return this.projects.filter(p => (!q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) && (!this.only() || this.updated(p, st) > 0));
  });
  totalUpdated = computed(() => Object.keys(this.status()).length);
  projectsUpdated = computed(() => { const st = this.status(); return this.projects.filter(p => this.updated(p, st) > 0).length; });
  errors = computed<Errs>(() => (this.submitted() ? this.validate() : { global: '', proj: {}, notes: {} }));

  ngOnInit() {
    const name = this.auth.fullName();
    const id = this.route.snapshot.paramMap.get('id');
    this.edit = !!id;
    this.record = id ? REPORTS.find(r => r.id === id) ?? null : null;
    if (this.edit && !canEditReport(this.record, name)) {
      this.locked = true;
      this.toast.error('This report can no longer be edited because the week of submission has ended.');
      this.router.navigateByUrl(this.auth.base() + '/reports');
      return;
    }
    this.projects = PROJECTS.filter(p => p.team.includes(name)).map(p => ({
      id: p.id, name: p.name, progress: p.progress,
      tasks: (p.tasks ?? []).filter((t: any) => t.assignees?.includes(name)).map((t: any) => ({ id: t.id, title: t.title, subtasks: t.subtasks.map((s: any) => ({ id: s.id, title: s.title })) }))
    }));
    this.projects.forEach(p => (this.range[p.id] = { start: this.periodStart, end: this.periodEnd }));

    if (this.record) { // prefill from the existing report
      const st: Record<string, string> = {}, nt: Record<string, string> = {}, ac: Record<string, string> = {}, ds: Record<string, string> = {};
      const op = new Set<string>();
      for (const e of this.record.entries) {
        if (!this.projects.some(p => p.id === e.projectId)) { this.kept.push(e); continue; }
        this.range[e.projectId] = { start: e.startDate, end: e.endDate };
        ac[e.projectId] = e.actualEndDate; ds[e.projectId] = e.description; op.add(e.projectId);
        for (const t of e.tasks ?? []) {
          if (t.status) st[t.id] = t.status;
          if (t.note) nt[t.id] = t.note;
          for (const s of t.subtasks ?? []) { if (s.status) st[s.id] = s.status; if (s.note) nt[s.id] = s.note; }
        }
      }
      this.status.set(st); this.note.set(nt); this.actual.set(ac); this.desc.set(ds); this.open.set(op);
    } else {
      this.open.set(new Set(this.projects.slice(0, 1).map(p => p.id)));
    }
  }

  total(p: PView) { return p.tasks.reduce((n, t) => n + 1 + t.subtasks.length, 0); }
  updated(p: PView, st: Record<string, string> = this.status()) {
    return p.tasks.reduce((n, t) => n + (st[t.id] ? 1 : 0) + t.subtasks.filter(s => st[s.id]).length, 0);
  }
  projErr(p: PView) { const e = this.errors(); return !!e.proj[p.id] || p.tasks.some(t => e.notes[t.id] || t.subtasks.some(s => e.notes[s.id])); }

  isOpen(id: string) { return this.open().has(id); }
  toggle(id: string) { this.open.update(o => { const n = new Set(o); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  expandAll() { this.open.set(new Set(this.projects.map(p => p.id))); }
  collapseAll() { this.open.set(new Set()); }

  setStatus(id: string, s: string) { this.dirty = true; this.status.update(m => { const n = { ...m }; n[id] === s ? delete n[id] : (n[id] = s); return n; }); }
  setNote(id: string, v: string) { this.dirty = true; this.note.update(m => ({ ...m, [id]: v })); }
  setActual(pid: string, v: string) { this.dirty = true; this.actual.update(m => ({ ...m, [pid]: v })); }
  setDesc(pid: string, v: string) { this.dirty = true; this.desc.update(m => ({ ...m, [pid]: v })); }

  private validate(): Errs {
    const t = (k: string) => this.i18n.t(k);
    const e: Errs = { global: '', proj: {}, notes: {} };
    const st = this.status();
    if (!Object.keys(st).length) e.global = t('Please choose a status for at least one task.');
    for (const p of this.projects) {
      if (this.updated(p, st) === 0) continue;
      const r = this.range[p.id], a = this.actual()[p.id], pe: { actual?: string; desc?: string } = {};
      if (!a) pe.actual = t('Please select the actual end date.');
      else if (a < r.start) pe.actual = t('The actual end date cannot be earlier than the start date.');
      else if (a > this.today) pe.actual = t('The actual end date cannot be in the future.');
      if (!(this.desc()[p.id] ?? '').trim()) pe.desc = t('Please enter a description of the activity.');
      if (pe.actual || pe.desc) e.proj[p.id] = pe;
      for (const tk of p.tasks) for (const id of [tk.id, ...tk.subtasks.map(s => s.id)]) {
        if (st[id] === 'Blocked' && !(this.note()[id] ?? '').trim()) e.notes[id] = t('Please explain what is blocking this task.');
      }
    }
    return e;
  }

  /** Sample-data persistence so the report shows up in My Reports. The back end will replace this. */
  private save() {
    const st = this.status(), nt = this.note();
    const entries = this.projects.filter(p => this.updated(p) > 0).map(p => {
      const tasks = p.tasks.filter(t => st[t.id] || t.subtasks.some(s => st[s.id])).map(t => ({
        id: t.id, title: t.title, status: st[t.id] ?? '', note: (nt[t.id] ?? '').trim(),
        subtasks: t.subtasks.filter(s => st[s.id]).map(s => ({ id: s.id, title: s.title, status: st[s.id], note: (nt[s.id] ?? '').trim() }))
      }));
      const all = tasks.flatMap(t => [t.status, ...t.subtasks.map(s => s.status)]).filter(Boolean);
      return { project: p.name, projectId: p.id, description: (this.desc()[p.id] ?? '').trim(), startDate: this.range[p.id].start, endDate: this.range[p.id].end, actualEndDate: this.actual()[p.id], activityStatus: worstStatus(all), tasks };
    });
    const everything = [...entries, ...this.kept];
    const summary = summarizeEntries(everything);
    if (this.edit && this.record) {
      Object.assign(this.record, { entries: everything, ...summary, reviewStatus: 'Awaiting Review', updatedAt: isoToday() });
    } else {
      const next = Math.max(...REPORTS.map(r => parseInt(String(r.id).slice(4), 10))) + 1;
      REPORTS.unshift({ id: 'RPT-' + next, employee: this.auth.fullName(), entries: everything, ...summary, reviewStatus: 'Awaiting Review', submittedAt: isoToday(), comments: [] });
    }
    for (const p of PROJECTS) for (const t of p.tasks ?? []) { // remember the last reported status on each task
      if (st[t.id]) t.status = st[t.id];
      for (const s of t.subtasks) if (st[s.id]) s.status = st[s.id];
    }
    saveProjects();
  }

  async submit() {
    if (this.closed || this.locked) return;
    this.submitted.set(true);
    const e = this.errors();
    if (e.global || Object.keys(e.proj).length || Object.keys(e.notes).length) {
      const bad = new Set<string>(Object.keys(e.proj));
      for (const p of this.projects) if (this.projErr(p)) bad.add(p.id);
      this.open.update(o => new Set([...o, ...bad]));
      this.toast.error(e.global || 'Please correct the highlighted fields.');
      return;
    }
    if (!this.edit) {
      const ok = await this.confirm.ask({ title: 'Submit Report', message: 'Are you sure you want to submit this weekly report?', confirmLabel: 'Submit Report' });
      if (!ok) return;
    }
    this.submitting.set(true);
    await new Promise(r => setTimeout(r, 900)); // simulated request
    if (this.edit && !canEditReport(this.record, this.auth.fullName())) { // the back end must enforce the same week rule
      this.submitting.set(false);
      this.toast.error('This report can no longer be edited because the week of submission has ended.');
      return;
    }
    this.save();
    this.submitting.set(false);
    this.dirty = false;
    this.toast.success(this.edit ? 'Weekly report updated. It is awaiting branch manager review again.' : 'Weekly report submitted successfully. It is now awaiting branch manager review.');
    this.router.navigateByUrl(this.auth.base() + '/reports');
  }

  async cancel() {
    if (this.dirty) {
      const ok = await this.confirm.ask({ title: 'Discard changes?', message: 'You have unsaved changes. If you leave now they will be lost.', confirmLabel: 'Discard changes', danger: true });
      if (!ok) return;
    }
    this.router.navigateByUrl(this.auth.base() + '/reports');
  }
}
