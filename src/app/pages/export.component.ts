import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../core/toast.service';
import { BRANCHES, PROJECTS, REPORTS } from '../core/mock-data';
import { isoToday } from '../core/report-rules';
import { PageHeaderComponent } from '../shared/page-header.component';
import { StatCardComponent } from '../shared/stat-card.component';
import { IconComponent } from '../shared/icon.component';
import { TPipe } from '../shared/t.pipe';

@Component({
  selector: 'app-export',
  standalone: true,
  imports: [TPipe, FormsModule, PageHeaderComponent, StatCardComponent, IconComponent],
  template: `
    <app-page-header title="Reports and Statistics" [crumbs]="['Reports & Statistics']" />
    <div class="stat-grid wide">
      <app-stat-card label="Total reports" [value]="reports.length" icon="file" />
      <app-stat-card label="Approved" [value]="count('Approved')" icon="check" />
      <app-stat-card label="Awaiting review" [value]="count('Awaiting Review')" icon="clock" [highlight]="true" />
      <app-stat-card label="Needing correction" [value]="count('Needs Correction')" icon="refresh" />
    </div>
    <div class="card form-card mt">
      <h3 class="card-title">{{ 'Excel export' | t }}</h3>
      <p class="muted">{{ 'Choose what to include, then export the filtered reports.' | t }}</p>
      <div class="form-grid">
        <div class="field"><label for="x-from">{{ 'From date' | t }}</label><input id="x-from" type="date" [(ngModel)]="from" /></div>
        <div class="field"><label for="x-to">{{ 'To date' | t }}</label><input id="x-to" type="date" [(ngModel)]="to" /></div>
        @if (rangeBad()) { <small class="error full" role="alert">{{ 'The end date cannot be earlier than the start date.' | t }}</small> }
        <div class="field"><label for="x-br">{{ 'Branch' | t }}</label>
          <select id="x-br" [(ngModel)]="branch"><option value="">{{ 'All branches' | t }}</option>@for (b of branches; track b.id) { <option [value]="b.name">{{ b.name | t }}</option> }</select></div>
        <div class="field"><label for="x-pj">{{ 'Project' | t }}</label>
          <select id="x-pj" [(ngModel)]="project"><option value="">{{ 'All projects' | t }}</option>@for (p of projects; track p.id) { <option [value]="p.name">{{ p.name | t }}</option> }</select></div>
        <div class="field"><label for="x-st">{{ 'Review status' | t }}</label>
          <select id="x-st" [(ngModel)]="status"><option value="">{{ 'All statuses' | t }}</option>@for (s of statuses; track s) { <option [value]="s">{{ s | t }}</option> }</select></div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-primary" [disabled]="busy() || rangeBad()" (click)="run()">
          @if (busy()) { <span class="spinner spinner-light"></span> {{ 'Preparing...' | t }} } @else { <app-icon name="download" /> {{ 'Export to Excel' | t }} }
        </button>
      </div>
    </div>`
})
export class ExportComponent {
  private toast = inject(ToastService);
  reports = REPORTS; branches = BRANCHES;
  statuses = ['Awaiting Review', 'Approved', 'Rejected', 'Needs Correction'];
  from = isoToday(); to = isoToday(); branch = ''; project = ''; status = '';
  projects = PROJECTS;
  busy = signal(false);
  count(s: string) { return REPORTS.filter(r => r.reviewStatus === s).length; }
  rangeBad() { return !!this.from && !!this.to && this.to < this.from; }
  async run() {
    this.busy.set(true);
    await new Promise(r => setTimeout(r, 900));
    this.busy.set(false);
    this.toast.info('Export request prepared. The file will be produced by the back end once it is connected.');
  }
}
