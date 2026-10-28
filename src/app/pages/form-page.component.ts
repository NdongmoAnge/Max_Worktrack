import { Component, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ConfirmService } from '../core/confirm.service';
import { ToastService } from '../core/toast.service';
import { ReportingService } from '../core/reporting.service';
import { I18nService } from '../core/i18n.service';
import { Field, FormConfig, FORM_CONFIGS } from '../core/form-configs';
import { ACCOUNTS, BRANCHES, DEPARTMENTS, ENTERPRISES, INVITATIONS, PROJECTS, REPORTS, USERS, effectiveStatus, lookup, newToken, saveBranches, saveDepartments, saveEnterprises, saveInvitations, saveProjects, saveUsers } from '../core/mock-data';
import { canEditReport, editDeadline, isoToday, summarizeEntries, toIso } from '../core/report-rules';
import { PageHeaderComponent } from '../shared/page-header.component';
import { IconComponent } from '../shared/icon.component';
import { TPipe } from '../shared/t.pipe';

@Component({
  selector: 'app-form-page',
  standalone: true,
  imports: [TPipe, ReactiveFormsModule, PageHeaderComponent, IconComponent],
  template: `
    @if (cfg) {
      <app-page-header [title]="title" [crumbs]="crumbs" />

      @if (cfg.mondayOnly) {
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
      }

      <form class="card form-card" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="form-grid">
          @for (f of fields; track f.key) {
            <div class="field" [class.full]="f.type === 'textarea' || f.type === 'multiselect' || f.type === 'activities'">
              <label [attr.for]="'f-' + f.key">{{ f.label | t }}@if (f.required && !f.readonly) { <span class="req" aria-hidden="true"> *</span> }</label>
              @switch (f.type) {
                @case ('textarea') { <textarea [id]="'f-' + f.key" rows="4" [formControlName]="f.key" [placeholder]="(f.placeholder || '') | t"></textarea> }
                @case ('select') {
                  <select [id]="'f-' + f.key" [formControlName]="f.key">
                    <option value="">{{ 'Select...' | t }}</option>
                    @for (o of opts(f); track o) { <option [value]="o">{{ o | t }}</option> }
                  </select>
                }
                @case ('multiselect') {
                  <div class="chips" role="group" [attr.aria-label]="f.label | t">
                    @for (o of opts(f); track o) {
                      <button type="button" class="chip" [class.on]="isOn(f.key, o)" [attr.aria-pressed]="isOn(f.key, o)" (click)="toggle(f.key, o)">@if (isOn(f.key, o)) { <app-icon name="check" /> }{{ o | t }}</button>
                    }
                  </div>
                }
                @case ('activities') {
                  <div class="activities" formArrayName="entries">
                    @for (g of entriesArr().controls; track g; let i = $index) {
                      <div class="activity-card" [formGroupName]="i">
                        <div class="activity-head">
                          <span class="activity-num">{{ i + 1 }}</span>
                          <strong>{{ 'Activity {n}' | t: { n: i + 1 } }}</strong>
                          @if (entriesArr().length > 1) {
                            <button type="button" class="btn btn-sm btn-danger-outline remove-btn" (click)="removeEntry(i)"><app-icon name="x" /> {{ 'Remove' | t }}</button>
                          }
                        </div>
                        <div class="form-grid">
                          <div class="field">
                            <label [attr.for]="'e' + i + '-project'">{{ 'Project' | t }} <span class="req" aria-hidden="true">*</span></label>
                            <select [id]="'e' + i + '-project'" formControlName="project">
                              <option value="">{{ 'Select...' | t }}</option>
                              @for (o of opts(f); track o) { <option [value]="o" [disabled]="usedElsewhere(o, i)">{{ o | t }}</option> }
                            </select>
                            @if (g.get('project')?.disabled) { <small class="hint">{{ 'The project of a submitted activity cannot be changed.' | t }}</small> }
                            @if (entryErr(g, 'project')) { <small class="error" role="alert">{{ entryErr(g, 'project') }}</small> }
                          </div>
                          <div class="field">
                            <label [attr.for]="'e' + i + '-status'">{{ 'Activity Status' | t }} <span class="req" aria-hidden="true">*</span></label>
                            <select [id]="'e' + i + '-status'" formControlName="activityStatus">
                              <option value="">{{ 'Select...' | t }}</option>
                              @for (o of statuses; track o) { <option [value]="o">{{ o | t }}</option> }
                            </select>
                            @if (entryErr(g, 'activityStatus')) { <small class="error" role="alert">{{ entryErr(g, 'activityStatus') }}</small> }
                          </div>
                          <div class="field">
                            <label [attr.for]="'e' + i + '-start'">{{ 'Start Date' | t }}</label>
                            <input [id]="'e' + i + '-start'" type="date" formControlName="startDate" class="locked" />
                          </div>
                          <div class="field">
                            <label [attr.for]="'e' + i + '-end'">{{ 'End Date' | t }}</label>
                            <input [id]="'e' + i + '-end'" type="date" formControlName="endDate" class="locked" />
                            <small class="hint">{{ 'Start and end dates are set by the system for this reporting period.' | t }}</small>
                          </div>
                          <div class="field">
                            <label [attr.for]="'e' + i + '-actual'">{{ 'Actual End Date' | t }} <span class="req" aria-hidden="true">*</span></label>
                            <input [id]="'e' + i + '-actual'" type="date" formControlName="actualEndDate" [min]="g.get('startDate')?.value" [max]="periodEnd" />
                            @if (entryErr(g, 'actualEndDate')) { <small class="error" role="alert">{{ entryErr(g, 'actualEndDate') }}</small> }
                          </div>
                          <div class="field full">
                            <label [attr.for]="'e' + i + '-desc'">{{ 'Change Description' | t }} <span class="req" aria-hidden="true">*</span></label>
                            <textarea [id]="'e' + i + '-desc'" rows="3" formControlName="description" [placeholder]="'Describe what you did this week...' | t"></textarea>
                            @if (entryErr(g, 'description')) { <small class="error" role="alert">{{ entryErr(g, 'description') }}</small> }
                          </div>
                        </div>
                      </div>
                    }
                    <button type="button" class="btn btn-outline add-activity" [disabled]="!canAdd()" (click)="addEntry()"><app-icon name="plus" /> {{ 'Add another project' | t }}</button>
                  </div>
                }
                @case ('file') {
                  <div class="file-row">
                    @if (previews[f.key]) { <img class="preview" [src]="previews[f.key]" [alt]="'Selected image preview' | t" /> }
                    <label class="btn btn-outline"><app-icon name="upload" /> {{ 'Choose file' | t }}<input type="file" accept="image/*" hidden (change)="onFile(f.key, $event)" /></label>
                    <small class="muted">{{ fileNames[f.key] || ('No file selected' | t) }}</small>
                  </div>
                }
                @default { <input [id]="'f-' + f.key" [type]="f.type" [formControlName]="f.key" [placeholder]="(f.placeholder || '') | t" [readonly]="!!f.readonly || (edit && !!f.lockOnEdit)" /> }
              }
              @if (f.hint) { <small class="hint">{{ f.hint | t }}</small> }
              @if (err(f)) { <small class="error" role="alert">{{ err(f) }}</small> }
            </div>
          }
        </div>
        @if (entity === 'project') {
          <div class="task-editor">
            <div class="te-head">
              <h3 class="card-title">{{ 'Tasks and subtasks' | t }}</h3>
              <button type="button" class="btn btn-sm btn-outline" (click)="addTask()"><app-icon name="plus" /> {{ 'Add task' | t }}</button>
            </div>
            @for (t of tasks; track t.id; let i = $index) {
              <div class="te-task">
                <div class="te-row">
                  <span class="activity-num">{{ i + 1 }}</span>
                  <input class="te-input" [value]="t.title" (input)="setTitle(t, $any($event.target).value)" [placeholder]="'Task title' | t" [attr.aria-label]="'Task title' | t" />
                  <button type="button" class="icon-act danger" [attr.data-tip]="'Remove task' | t" [attr.aria-label]="'Remove task' | t" (click)="removeTask(i)"><app-icon name="trash" /></button>
                </div>
                <div class="chips te-assign" role="group" [attr.aria-label]="'Assigned to' | t">
                  @for (m of teamOptions(); track m) {
                    <button type="button" class="chip" [class.on]="t.assignees.includes(m)" [attr.aria-pressed]="t.assignees.includes(m)" (click)="toggleAssignee(t, m)">{{ m }}</button>
                  } @empty { <small class="muted">{{ 'Choose the assigned users above first.' | t }}</small> }
                </div>
                @for (s of t.subtasks; track s.id; let j = $index) {
                  <div class="te-row sub">
                    <span class="te-dot"></span>
                    <input class="te-input" [value]="s.title" (input)="setTitle(s, $any($event.target).value)" [placeholder]="'Subtask title' | t" [attr.aria-label]="'Subtask title' | t" />
                    <button type="button" class="icon-act danger" [attr.data-tip]="'Remove subtask' | t" [attr.aria-label]="'Remove subtask' | t" (click)="removeSub(t, j)"><app-icon name="x" /></button>
                  </div>
                }
                <button type="button" class="link" (click)="addSub(t)">+ {{ 'Add subtask' | t }}</button>
              </div>
            } @empty { <p class="muted">{{ 'No tasks yet. Add the first task of this project.' | t }}</p> }
          </div>
        }
        <div class="form-actions">
          <button type="button" class="btn btn-outline" (click)="cancel()">{{ 'Cancel' | t }}</button>
          <button type="submit" class="btn btn-primary" [disabled]="submitting() || closed || locked">
            @if (submitting()) { <span class="spinner spinner-light"></span> {{ 'Saving...' | t }} } @else { {{ (edit && cfg.editSubmitLabel ? cfg.editSubmitLabel : cfg.submitLabel) | t }} }
          </button>
        </div>
      </form>
    }`
})
export class FormPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);
  private i18n = inject(I18nService);
  reporting = inject(ReportingService);

  cfg!: FormConfig;
  entity = '';
  record: any = null;
  fields: Field[] = [];
  form: FormGroup = new FormGroup({});
  edit = false;
  locked = false;
  submitted = false;
  submitting = signal(false);
  previews: Record<string, string | null> = {};
  fileNames: Record<string, string> = {};

  get title() { return this.edit && this.cfg.editTitle ? this.cfg.editTitle : this.cfg.title; }
  get crumbs() { return this.cfg.crumbs.map(c => (this.edit && (c === 'Create' || c === 'Submit' || c === 'Invite') ? 'Edit' : c)); }
  /** New weekly reports can only be submitted while the reporting period is open; edits are limited by the week rule instead. */
  get closed() { return !!this.cfg?.mondayOnly && !this.edit && !this.reporting.open(); }
  get nextDateLabel() { return new Date(this.reporting.nextDate() + 'T00:00:00').toLocaleDateString(this.i18n.locale, { weekday: 'long', day: 'numeric', month: 'long' }); }
  get deadline() { return this.record ? editDeadline(this.record, this.i18n.locale) : ''; }

  ngOnInit() {
    const d = this.route.snapshot.data;
    this.entity = d['entity'];
    this.edit = d['mode'] === 'edit';
    this.cfg = FORM_CONFIGS[this.entity];
    const id = this.route.snapshot.paramMap.get('id');
    this.record = this.edit ? lookup(this.entity, id) : null;
    // only the person who created an account (the inviter) can change its details
    if ((this.entity === 'user' || this.entity === 'branch-user') && this.edit && this.record && this.record.createdBy !== this.auth.user()!.email) {
      this.locked = true;
      this.toast.error('Only the person who created this account can change it.');
      this.router.navigateByUrl(this.resolve(this.cfg.listLink));
    }
    this.fields = this.cfg.fields.filter(f => !(this.edit && f.createOnly));
    if (this.entity === 'project') this.tasks = JSON.parse(JSON.stringify(this.record?.tasks ?? []));

    // Weekly report: only the owner may edit, and only during the week it was submitted.
    if (this.entity === 'report' && this.edit && !canEditReport(this.record, this.auth.fullName())) {
      this.locked = true;
      this.toast.error('This report can no longer be edited because the week of submission has ended.');
      this.router.navigateByUrl(this.auth.base() + '/reports');
    }

    const controls: Record<string, AbstractControl> = {};
    for (const f of this.fields) {
      if (f.type === 'activities') {
        const rows = this.record?.entries?.length ? this.record.entries : [{}];
        controls[f.key] = new FormArray(rows.map((e: any) => this.entryGroup(e)));
        continue;
      }
      let v: any = this.record ? this.record[f.key] : f.defaultValue === 'today' ? isoToday() : f.defaultValue ?? '';
      if (f.type === 'multiselect') v = this.record?.[f.key] ?? [];
      if (f.key === 'employeeName') v = this.auth.fullName();
      if (this.entity === 'branch-user' && f.key === 'branch') v = this.auth.user()!.branch ?? '';
      const validators = [];
      if (f.required) validators.push(Validators.required);
      if (f.type === 'email') validators.push(Validators.email);
      controls[f.key] = new FormControl(v ?? '', validators);
    }
    const r = this.cfg.dateRange;
    this.form = new FormGroup(controls, r ? { validators: [(g: AbstractControl): ValidationErrors | null => {
      const s = g.get(r.start)?.value, e = g.get(r.end)?.value;
      return s && e && e < s ? { range: true } : null;
    }] } : {});
  }

  statuses = ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];

  entriesArr(): FormArray { return this.form.get('entries') as FormArray; }
  /** Reporting period: fixed by the system (7 days ending today). Employees cannot change these dates. */
  periodEnd = isoToday();
  periodStart = toIso(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 6));

  private entryGroup(e: any = {}): FormGroup {
    const lockProject = this.edit && !!e.project; // the project (activity) of a submitted entry cannot be changed
    return new FormGroup({
      project: new FormControl({ value: e.project ?? '', disabled: lockProject }, Validators.required),
      activityStatus: new FormControl(e.activityStatus ?? '', Validators.required),
      startDate: new FormControl({ value: e.startDate ?? this.periodStart, disabled: true }),
      endDate: new FormControl({ value: e.endDate ?? this.periodEnd, disabled: true }),
      actualEndDate: new FormControl(e.actualEndDate ?? '', Validators.required),
      description: new FormControl(e.description ?? '', Validators.required)
    }, { validators: [(g: AbstractControl): ValidationErrors | null => {
      const start = g.get('startDate')?.value, actual = g.get('actualEndDate')?.value;
      if (actual && start && actual < start) return { actualBeforeStart: true };
      if (actual && actual > this.periodEnd) return { actualFuture: true };
      return null;
    }] });
  }
  private activitiesField() { return this.fields.find(f => f.type === 'activities')!; }
  canAdd() { return this.entriesArr().length < this.opts(this.activitiesField()).length; }
  addEntry() { this.entriesArr().push(this.entryGroup()); this.form.markAsDirty(); }
  removeEntry(i: number) { this.entriesArr().removeAt(i); this.form.markAsDirty(); }
  usedElsewhere(name: string, i: number) {
    return this.entriesArr().controls.some((g, j) => j !== i && g.get('project')!.value === name);
  }
  entryErr(g: AbstractControl, key: string): string {
    const c = g.get(key);
    if (!c || !(c.touched || this.submitted)) return '';
    if (key === 'actualEndDate') {
      if (c.errors?.['required']) return this.i18n.t('Please select the actual end date.');
      if (g.hasError('actualBeforeStart')) return this.i18n.t('The actual end date cannot be earlier than the start date.');
      if (g.hasError('actualFuture')) return this.i18n.t('The actual end date cannot be in the future.');
      return '';
    }
    if (!c.errors?.['required']) return '';
    const msgs: Record<string, string> = {
      project: 'Please select a project.', activityStatus: 'Please select the activity status.',
      startDate: 'Please select the start date.', endDate: 'Please select the end date.',
      description: 'Please enter a description of the activity.'
    };
    return this.i18n.t(msgs[key]);
  }

  opts(f: Field): string[] {
    const list = typeof f.options === 'function' ? f.options(this.auth.user()!) : f.options || [];
    const saved = this.record?.[f.key];
    return f.type === 'select' && saved && !list.includes(saved) ? [...list, saved] : list;
  }
  isOn(k: string, o: string) { return (this.form.get(k)!.value as string[]).includes(o); }
  toggle(k: string, o: string) {
    const c = this.form.get(k)!; const cur = c.value as string[];
    c.setValue(cur.includes(o) ? cur.filter(x => x !== o) : [...cur, o]);
    c.markAsDirty(); c.markAsTouched();
  }
  onFile(k: string, e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.fileNames[k] = file.name;
    const reader = new FileReader();
    reader.onload = () => (this.previews[k] = reader.result as string);
    reader.readAsDataURL(file);
    this.form.markAsDirty();
  }

  err(f: Field): string {
    const c = this.form.get(f.key);
    if (!c) return '';
    const shown = c.touched || this.submitted;
    const r = this.cfg.dateRange;
    if (shown && r && f.key === r.end && this.form.hasError('range')) return this.i18n.t(r.message);
    if (!shown || !c.errors) return '';
    if (c.errors['required']) {
      if (f.requiredMsg) return this.i18n.t(f.requiredMsg);
      const pick = f.type === 'select' || f.type === 'multiselect' || f.type === 'date';
      return this.i18n.t(pick ? 'Please select {field}.' : 'Please enter {field}.', { field: this.i18n.t(f.label).toLowerCase() });
    }
    if (c.errors['email']) return this.i18n.t('Please enter a valid email address.');
    return '';
  }

  resolve(t: string) { return t.replace('{base}', this.auth.base()); }

  /** Sample-data persistence so created/edited reports show up in My Reports. The back end will replace this. */
  private saveReport() {
    const v = this.form.getRawValue();
    const entries = v.entries.map((e: any) => ({
      project: e.project, projectId: PROJECTS.find(p => p.name === e.project)?.id ?? '',
      description: e.description, startDate: e.startDate, endDate: e.endDate, actualEndDate: e.actualEndDate, activityStatus: e.activityStatus
    }));
    const data = { entries, ...summarizeEntries(entries) };
    if (this.edit && this.record) {
      Object.assign(this.record, data, { reviewStatus: 'Awaiting Review', updatedAt: isoToday() });
    } else {
      const next = Math.max(...REPORTS.map(r => parseInt(String(r.id).slice(4), 10))) + 1;
      REPORTS.unshift({ id: 'RPT-' + next, employee: this.auth.fullName(), ...data, reviewStatus: 'Awaiting Review', submittedAt: isoToday(), comments: [] });
    }
  }

  /** Company Admin: create or edit a project with its tasks and subtasks (sample storage; the back end will replace this). */
  private saveProject() {
    const v = this.form.getRawValue();
    const branch = USERS.find(u => u.name === v.manager)?.branch ?? 'Douala HQ';
    const base = { name: v.name, description: v.description, plannedStart: v.plannedStart, plannedFinish: v.plannedFinish, manager: v.manager, team: v.team, branch };
    const pid = this.edit && this.record ? this.record.id : 'PRJ-' + String(Math.max(0, ...PROJECTS.map(p => parseInt(String(p.id).slice(4), 10))) + 1).padStart(3, '0');
    const stamp = Date.now().toString(36);
    const tasks = this.tasks.filter(t => String(t.title).trim()).map((t, i) => {
      const tid = String(t.id).startsWith('new-') ? pid + '-T' + stamp + i : t.id;
      return {
        id: tid, title: String(t.title).trim(), status: t.status ?? '',
        assignees: (t.assignees ?? []).filter((a: string) => v.team.includes(a)),
        subtasks: (t.subtasks ?? []).filter((s: any) => String(s.title).trim()).map((s: any, j: number) => ({ id: String(s.id).startsWith('new-') ? tid + '-S' + stamp + j : s.id, title: String(s.title).trim(), status: s.status ?? '' }))
      };
    });
    if (this.edit && this.record) Object.assign(this.record, base, { tasks });
    else PROJECTS.push({ id: pid, ...base, actualStart: '—', actualFinish: '—', delay: 'Not started yet', delayDays: 0, progress: 0, tasks });
    saveProjects();
  }

  // ---- task editor (project form)
  tasks: any[] = [];
  private seq = 0;
  teamOptions(): string[] { return this.form.get('team')?.value ?? []; }
  addTask() { this.tasks.push({ id: 'new-' + (++this.seq), title: '', assignees: [], status: '', subtasks: [] }); this.form.markAsDirty(); }
  removeTask(i: number) { this.tasks.splice(i, 1); this.form.markAsDirty(); }
  addSub(t: any) { t.subtasks.push({ id: 'new-' + (++this.seq), title: '', status: '' }); this.form.markAsDirty(); }
  removeSub(t: any, j: number) { t.subtasks.splice(j, 1); this.form.markAsDirty(); }
  toggleAssignee(t: any, name: string) { const i = t.assignees.indexOf(name); i >= 0 ? t.assignees.splice(i, 1) : t.assignees.push(name); this.form.markAsDirty(); }
  setTitle(o: any, v: string) { o.title = v; this.form.markAsDirty(); }

  private saveBranch() {
    const v = this.form.getRawValue();
    if (this.edit && this.record) Object.assign(this.record, { name: v.name, city: v.city, manager: v.manager });
    else BRANCHES.push({ id: Math.max(0, ...BRANCHES.map(b => b.id)) + 1, name: v.name, city: v.city, manager: v.manager, employees: 0, status: 'Active' });
    saveBranches();
  }

  private saveDepartment() {
    const v = this.form.getRawValue();
    if (this.edit && this.record) Object.assign(this.record, { name: v.name, branch: v.branch, head: v.head });
    else DEPARTMENTS.push({ id: Math.max(0, ...DEPARTMENTS.map(d => d.id)) + 1, name: v.name, branch: v.branch, head: v.head, members: 0 });
    saveDepartments();
  }

  /** Super Admin: invite a Company Admin for an existing enterprise. */
  private saveInvitation() {
    const v = this.form.getRawValue();
    INVITATIONS.unshift({ id: Math.max(...INVITATIONS.map(i => i.id)) + 1, token: newToken(), role: 'Company Admin', enterprise: v.enterprise, invitee: v.firstName + ' ' + v.lastName, firstName: v.firstName, lastName: v.lastName, email: v.email, status: 'Pending', invitedAt: isoToday(), expiresAt: toIso(new Date(Date.now() + 7 * 86400000)), invitedBy: this.auth.fullName() });
    saveInvitations();
  }

  /** Company Admin: invite a Branch Manager, Employee or Intern (edit just updates the record). Returns false when the e-mail is already used. */
  private saveUser(): boolean {
    const v = this.form.getRawValue();
    if (this.entity === 'branch-user') v.branch = this.auth.user()!.branch; // a branch manager can only invite into their own branch
    if (this.edit && this.record) {
      Object.assign(this.record, { firstName: v.firstName, lastName: v.lastName, name: v.firstName + ' ' + v.lastName, email: v.email, role: v.role, branch: v.branch, department: v.department });
      saveUsers();
      return true;
    }
    const email = String(v.email).trim().toLowerCase();
    const taken = USERS.some(u => String(u.email).toLowerCase() === email) || ACCOUNTS.some(a => a.email.toLowerCase() === email)
      || INVITATIONS.some(i => String(i.email).toLowerCase() === email && effectiveStatus(i) === 'Pending');
    if (taken) { this.toast.error('This email address already has an account or a pending invitation.'); return false; }
    const name = v.firstName + ' ' + v.lastName;
    USERS.push({ id: Math.max(...USERS.map(u => u.id)) + 1, firstName: v.firstName, lastName: v.lastName, name, email, role: v.role, branch: v.branch, department: v.department, status: 'Active', invitation: 'Pending', weeklyReport: 'Missing', createdBy: this.auth.user()!.email });
    INVITATIONS.unshift({ id: Math.max(...INVITATIONS.map(i => i.id)) + 1, token: newToken(), enterprise: this.auth.user()!.enterprise, invitee: name, firstName: v.firstName, lastName: v.lastName, email, role: v.role, branch: v.branch, department: v.department, status: 'Pending', invitedAt: isoToday(), expiresAt: toIso(new Date(Date.now() + 7 * 86400000)), invitedBy: this.auth.fullName() });
    saveUsers(); saveInvitations();
    return true;
  }

  private saveEnterprise() {
    const v = this.form.getRawValue();
    if (this.edit && this.record) {
      Object.assign(this.record, { name: v.name, email: v.email, phone: v.phone, address: v.address, defaultLanguage: v.defaultLanguage });
    } else {
      const id = Math.max(...ENTERPRISES.map(e => e.id)) + 1;
      ENTERPRISES.push({ id, name: v.name, defaultLanguage: v.defaultLanguage, email: v.email, phone: v.phone, address: v.address, status: 'Active', createdAt: isoToday(), adminName: v.adminFirstName + ' ' + v.adminLastName });
      INVITATIONS.unshift({ id: Math.max(...INVITATIONS.map(i => i.id)) + 1, token: newToken(), role: 'Company Admin', enterprise: v.name, invitee: v.adminFirstName + ' ' + v.adminLastName, firstName: v.adminFirstName, lastName: v.adminLastName, email: v.adminEmail, status: 'Pending', invitedAt: isoToday(), expiresAt: toIso(new Date(Date.now() + 7 * 86400000)), invitedBy: this.auth.fullName() });
      saveInvitations();
    }
    saveEnterprises();
  }

  async submit() {
    if (this.closed || this.locked) return;
    this.submitted = true;
    this.form.markAllAsTouched();
    if (this.form.invalid) { this.toast.error('Please correct the highlighted fields.'); return; }
    if (this.entity === 'report') {
      const names = this.entriesArr().controls.map(g => g.get('project')!.value);
      if (new Set(names).size !== names.length) { this.toast.error('Each project can only be added once per report.'); return; }
    }
    if (this.cfg.confirmMessage && !this.edit) {
      const ok = await this.confirm.ask({ title: this.cfg.submitLabel, message: this.cfg.confirmMessage, confirmLabel: this.cfg.submitLabel });
      if (!ok) return;
    }
    this.submitting.set(true);
    await new Promise(r => setTimeout(r, 900)); // simulated request
    // Re-check the week rule at save time (the back end must enforce it too).
    if (this.entity === 'report' && this.edit && !canEditReport(this.record, this.auth.fullName())) {
      this.submitting.set(false);
      this.toast.error('This report can no longer be edited because the week of submission has ended.');
      return;
    }
    if (this.entity === 'report') this.saveReport();
    if (this.entity === 'enterprise') this.saveEnterprise();
    if (this.entity === 'project') this.saveProject();
    if (this.entity === 'branch') this.saveBranch();
    if (this.entity === 'department') this.saveDepartment();
    if (this.entity === 'invitation') this.saveInvitation();
    if ((this.entity === 'user' || this.entity === 'branch-user') && !this.saveUser()) { this.submitting.set(false); return; }
    this.submitting.set(false);
    this.form.markAsPristine();
    this.toast.success(this.edit ? this.cfg.updateMessage || 'Changes saved successfully.' : this.cfg.successMessage);
    this.router.navigateByUrl(this.resolve(this.cfg.listLink));
  }

  async cancel() {
    if (this.form.dirty) {
      const ok = await this.confirm.ask({ title: 'Discard changes?', message: 'You have unsaved changes. If you leave now they will be lost.', confirmLabel: 'Discard changes', danger: true });
      if (!ok) return;
    }
    this.router.navigateByUrl(this.resolve(this.cfg.listLink));
  }
}
