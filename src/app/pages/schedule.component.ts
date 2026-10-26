import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { I18nService } from '../core/i18n.service';
import { ScheduleService } from '../core/schedule.service';
import { ToastService } from '../core/toast.service';
import { USERS } from '../core/mock-data';
import { isoToday } from '../core/report-rules';
import { PageHeaderComponent } from '../shared/page-header.component';
import { StatusBadgeComponent } from '../shared/status-badge.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { IconComponent } from '../shared/icon.component';
import { TPipe } from '../shared/t.pipe';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [TPipe, FormsModule, PageHeaderComponent, StatusBadgeComponent, EmptyStateComponent, IconComponent],
  template: `
    <app-page-header title="Reporting Schedule" [crumbs]="['Reporting Schedule']" />
    <div class="alert alert-info" role="status"><app-icon name="info" /> {{ 'Choose the day each employee or intern must submit the weekly report. The date repeats every week.' | t }}</div>

    <div class="card form-card">
      <h3 class="card-title">{{ 'Set the report date' | t }}</h3>
      <div class="form-grid">
        <div class="field">
          <label for="sd">{{ 'Report date' | t }} <span class="req" aria-hidden="true">*</span></label>
          <input id="sd" type="date" [min]="today" [(ngModel)]="date" />
          @if (dateErr()) { <small class="error" role="alert">{{ dateErr() | t }}</small> }
        </div>
        <div class="field">
          <label>{{ 'People' | t }}</label>
          <p class="muted sel-count">{{ '{n} selected' | t: { n: selected().size } }}</p>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-outline" (click)="toggleAll()">{{ (allSelected() ? 'Clear selection' : 'Select all') | t }}</button>
        <button type="button" class="btn btn-primary" (click)="apply()"><app-icon name="calendar" /> {{ 'Apply to selected' | t }}</button>
      </div>
    </div>

    <div class="card table-card mt">
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th scope="col" class="check-col"><input type="checkbox" [checked]="allSelected()" (change)="toggleAll()" [attr.aria-label]="'Select all' | t" /></th>
              <th scope="col"><span class="th-btn">{{ 'Name' | t }}</span></th>
              <th scope="col"><span class="th-btn">{{ 'Role' | t }}</span></th>
              @if (isCompany) { <th scope="col"><span class="th-btn">{{ 'Branch' | t }}</span></th> }
              <th scope="col"><span class="th-btn">{{ 'Next report date' | t }}</span></th>
              <th scope="col"><span class="th-btn">{{ 'Repeats every' | t }}</span></th>
              <th scope="col"><span class="th-btn">{{ 'Today' | t }}</span></th>
              <th scope="col"><span class="th-btn">{{ 'Actions' | t }}</span></th>
            </tr>
          </thead>
          <tbody>
            @for (r of rows(); track r.name) {
              <tr>
                <td class="check-col"><input type="checkbox" [checked]="selected().has(r.name)" (change)="toggle(r.name)" [attr.aria-label]="'Select {name}' | t: { name: r.name }" /></td>
                <td [attr.data-label]="'Name' | t"><strong>{{ r.name }}</strong></td>
                <td [attr.data-label]="'Role' | t">{{ r.role | t }}</td>
                @if (isCompany) { <td [attr.data-label]="'Branch' | t">{{ r.branch | t }}</td> }
                <td [attr.data-label]="'Next report date' | t">{{ r.label }} @if (!r.custom) { <small class="muted">({{ 'Default (Monday)' | t }})</small> }</td>
                <td [attr.data-label]="'Repeats every' | t">{{ r.weekday }}</td>
                <td [attr.data-label]="'Today' | t"><app-status-badge [status]="r.open ? 'Open today' : 'Closed today'" /></td>
                <td class="row-actions" [attr.data-label]="'Actions' | t">
                  <button type="button" class="btn btn-sm btn-outline" (click)="change(r.name)"><app-icon name="edit" />{{ 'Change date' | t }}</button>
                  @if (r.custom) { <button type="button" class="btn btn-sm btn-outline" (click)="reset(r.name)"><app-icon name="refresh" />{{ 'Reset to Monday' | t }}</button> }
                </td>
              </tr>
            } @empty { <tr><td colspan="8"><app-empty-state message="No employees or interns found in this branch." /></td></tr> }
          </tbody>
        </table>
      </div>
    </div>`
})
export class ScheduleComponent {
  private auth = inject(AuthService);
  private i18n = inject(I18nService);
  private schedule = inject(ScheduleService);
  private toast = inject(ToastService);

  today = isoToday();
  date = '';
  tried = false;
  selected = signal<Set<string>>(new Set());

  /** Company admin: everyone in the enterprise. Branch manager: only their own branch. */
  isCompany = this.auth.role() === 'company_admin';
  private people = USERS.filter(u => (u.role === 'Employee' || u.role === 'Intern') && (this.isCompany || u.branch === this.auth.user()!.branch));

  rows = computed(() => {
    this.i18n.lang();
    return this.people.map(u => {
      const next = this.schedule.nextFor(u.name);
      const d = new Date(next + 'T00:00:00');
      return {
        name: u.name, role: u.role, branch: u.branch, custom: this.schedule.anchor(u.name) !== null, open: next === isoToday(),
        label: d.toLocaleDateString(this.i18n.locale, { weekday: 'long', day: 'numeric', month: 'long' }),
        weekday: d.toLocaleDateString(this.i18n.locale, { weekday: 'long' })
      };
    });
  });
  allSelected() { return this.people.length > 0 && this.selected().size === this.people.length; }
  toggle(n: string) { this.selected.update(s => { const x = new Set(s); x.has(n) ? x.delete(n) : x.add(n); return x; }); }
  toggleAll() { this.selected.set(this.allSelected() ? new Set() : new Set(this.people.map(u => u.name))); }
  change(n: string) { this.selected.set(new Set([n])); setTimeout(() => document.getElementById('sd')?.focus()); }

  dateErr() {
    if (!this.tried) return '';
    if (!this.date) return 'Please select a report date.';
    if (this.date < this.today) return 'The report date cannot be in the past.';
    return '';
  }

  apply() {
    this.tried = true;
    if (this.dateErr()) return;
    if (this.selected().size === 0) { this.toast.error('Please select at least one employee or intern.'); return; }
    const names = [...this.selected()];
    this.schedule.set(names, this.date);
    const label = new Date(this.date + 'T00:00:00').toLocaleDateString(this.i18n.locale, { weekday: 'long', day: 'numeric', month: 'long' });
    this.toast.success(this.i18n.t('Report date set to {date} for {n} person(s).', { date: label, n: names.length }));
    this.selected.set(new Set()); this.date = ''; this.tried = false;
  }
  reset(n: string) {
    this.schedule.reset([n]);
    this.toast.info(this.i18n.t('Report date reset to Monday for {name}.', { name: n }));
  }
}
