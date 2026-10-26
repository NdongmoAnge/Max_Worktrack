import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ConfirmService } from '../core/confirm.service';
import { ToastService } from '../core/toast.service';
import { I18nService } from '../core/i18n.service';
import { REPORTS } from '../core/mock-data';
import { canEditReport, editDeadline } from '../core/report-rules';
import { PageHeaderComponent } from '../shared/page-header.component';
import { StatusBadgeComponent } from '../shared/status-badge.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { IconComponent } from '../shared/icon.component';
import { TPipe } from '../shared/t.pipe';

type Decision = 'Approved' | 'Rejected' | 'Needs Correction';

@Component({
  selector: 'app-report-details',
  standalone: true,
  imports: [TPipe, FormsModule, RouterLink, PageHeaderComponent, StatusBadgeComponent, EmptyStateComponent, IconComponent],
  template: `
    @if (report(); as r) {
      <app-page-header [title]="'Report {id}' | t: { id: r.id }" [crumbs]="['Reports', r.id]">
        <a class="btn btn-outline" [routerLink]="[auth.base(), 'reports']"><app-icon name="chevron-left" /> {{ 'Back to Reports' | t }}</a>
        @if (isOwner && canEdit(r)) {
          <a class="btn btn-primary" [routerLink]="[auth.base(), 'reports', r.id, 'edit']"><app-icon name="edit" /> {{ 'Edit report' | t }}</a>
        }
      </app-page-header>

      @if (isOwner && canEdit(r)) {
        <div class="alert alert-info" role="status"><app-icon name="info" /> {{ 'You can edit this report until {date}.' | t: { date: deadline(r) } }}</div>
      }
      @if (isOwner && !canEdit(r)) {
        <div class="alert alert-warning" role="status"><app-icon name="alert" /> {{ 'Editing is closed for this report because the week of submission has ended.' | t }}</div>
      }
      @if (isOwner && r.reviewStatus === 'Awaiting Review') {
        <div class="alert alert-info" role="status"><app-icon name="info" /> {{ 'Your weekly report is awaiting branch manager review.' | t }}</div>
      }
      @if (isOwner && r.reviewStatus === 'Needs Correction') {
        <div class="alert alert-warning" role="status"><app-icon name="alert" /> {{ 'A correction was requested. Please read the comments below.' | t }}</div>
      }

      <div class="two-col">
        <div class="stack">
          <div class="card pad">
            <h3 class="card-title">{{ 'Report details' | t }}</h3>
            <dl class="details">
              <div><dt>{{ 'Employee' | t }}</dt><dd>{{ r.employee }}</dd></div>
              <div><dt>{{ 'Submission date' | t }}</dt><dd>{{ r.submittedAt }}</dd></div>
              <div><dt>{{ 'Review status' | t }}</dt><dd><app-status-badge [status]="r.reviewStatus" /></dd></div>
              <div><dt>{{ 'Number of projects' | t }}</dt><dd>{{ r.entries.length }}</dd></div>
            </dl>
          </div>
          <h3 class="section-title">{{ 'Project activities' | t }}</h3>
          @for (e of r.entries; track $index) {
            <div class="card pad activity-view">
              <div class="activity-head">
                <span class="activity-num">{{ $index + 1 }}</span>
                <strong>{{ e.project | t }}</strong>
                <app-status-badge [status]="e.activityStatus" />
              </div>
              <p class="entry-desc">{{ e.description }}</p>
              <dl class="entry-dates">
                <div><dt>{{ 'Start date' | t }}</dt><dd>{{ e.startDate }}</dd></div>
                <div><dt>{{ 'End date' | t }}</dt><dd>{{ e.endDate }}</dd></div>
                <div><dt>{{ 'Actual end date' | t }}</dt><dd>{{ e.actualEndDate || '—' }}</dd></div>
              </dl>
            </div>
          }
        </div>

        <div class="stack">
          <div class="card pad">
            <h3 class="card-title">{{ 'Review comments' | t }}</h3>
            <ul class="feed">
              @for (c of r.comments; track $index) {
                <li><div><strong>{{ c.text | t }}</strong><small>{{ c.by }} - {{ c.at }}</small></div><app-status-badge [status]="c.decision" /></li>
              } @empty { <li><app-empty-state message="No review comments yet." icon="file" /></li> }
            </ul>
          </div>

          @if (isReviewer && r.reviewStatus === 'Awaiting Review') {
            <div class="card pad">
              <h3 class="card-title">{{ 'Review this report' | t }}</h3>
              <div class="field">
                <label for="rc">{{ 'Comment' | t }}</label>
                <textarea id="rc" rows="3" [(ngModel)]="comment" [placeholder]="'Add a comment for the employee...' | t"></textarea>
                @if (commentErr()) { <small class="error" role="alert">{{ 'Please add a comment explaining your decision.' | t }}</small> }
              </div>
              <div class="btn-row">
                <button type="button" class="btn btn-success" [disabled]="busy()" (click)="decide('Approved')"><app-icon name="check" /> {{ 'Approve' | t }}</button>
                <button type="button" class="btn btn-warning" [disabled]="busy()" (click)="decide('Needs Correction')"><app-icon name="refresh" /> {{ 'Request Correction' | t }}</button>
                <button type="button" class="btn btn-danger" [disabled]="busy()" (click)="decide('Rejected')"><app-icon name="x" /> {{ 'Reject' | t }}</button>
              </div>
            </div>
          }
        </div>
      </div>
    } @else {
      <app-empty-state message="Report not found." />
    }`
})
export class ReportDetailsComponent implements OnInit {
  auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);
  private i18n = inject(I18nService);
  report = signal<any>(null);
  comment = '';
  commentErr = signal(false);
  busy = signal(false);

  get isReviewer() { return this.auth.role() === 'branch_manager' || this.auth.role() === 'company_admin'; }
  get isOwner() {
    const r = this.report();
    return !!r && (this.auth.role() === 'employee' || this.auth.role() === 'intern') && r.employee === this.auth.fullName();
  }
  canEdit(r: any) { return canEditReport(r, this.auth.fullName()); }
  deadline(r: any) { return editDeadline(r, this.i18n.locale); }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const r = REPORTS.find(x => x.id === id);
    this.report.set(r ? { ...r } : null);
  }

  async decide(d: Decision) {
    if (d !== 'Approved' && !this.comment.trim()) { this.commentErr.set(true); return; }
    this.commentErr.set(false);
    const text = d === 'Approved' ? 'Are you sure you want to approve this activity report?'
      : d === 'Rejected' ? 'Are you sure you want to reject this activity report?'
      : 'Request a correction on this activity report? The employee will be asked to update it.';
    const label = d === 'Approved' ? 'Approve' : d === 'Rejected' ? 'Reject' : 'Request correction';
    const title = d === 'Approved' ? 'Approve report' : d === 'Rejected' ? 'Reject report' : 'Request correction';
    const ok = await this.confirm.ask({ title, message: text, confirmLabel: label, danger: d === 'Rejected' });
    if (!ok) return;
    this.busy.set(true);
    await new Promise(r => setTimeout(r, 700)); // simulated request
    const today = new Date().toISOString().slice(0, 10);
    const cur = this.report();
    const updated = { ...cur, reviewStatus: d, reviewedAt: today, comments: [...cur.comments, { by: this.auth.fullName(), text: this.comment.trim() || 'No comment.', at: today, decision: d }] };
    const src = REPORTS.find(x => x.id === cur.id);
    if (src) Object.assign(src, updated);
    this.report.set(updated);
    this.comment = '';
    this.busy.set(false);
    this.toast.success(d === 'Approved' ? 'Report approved successfully.' : d === 'Rejected' ? 'Report rejected successfully.' : 'Report sent back for correction successfully.');
  }
}
