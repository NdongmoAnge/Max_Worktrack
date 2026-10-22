import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { PROJECTS, REPORTS } from '../core/mock-data';
import { PageHeaderComponent } from '../shared/page-header.component';
import { StatusBadgeComponent } from '../shared/status-badge.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { IconComponent } from '../shared/icon.component';
import { TPipe } from '../shared/t.pipe';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [TPipe, RouterLink, PageHeaderComponent, StatusBadgeComponent, EmptyStateComponent, IconComponent],
  template: `
    @if (p) {
      <app-page-header [title]="p.name" [crumbs]="['Projects', p.id]">
        <a class="btn btn-outline" [routerLink]="[auth.base(), 'projects']"><app-icon name="chevron-left" /> {{ 'Back to Projects' | t }}</a>
        @if (auth.role() === 'company_admin') { <a class="btn btn-primary" [routerLink]="[auth.base(), 'projects', p.id, 'edit']"><app-icon name="edit" /> {{ 'Edit' | t }}</a> }
      </app-page-header>

      @if (p.status === 'Delayed') {
        <div class="alert alert-warning" role="status"><app-icon name="alert" /> {{ 'This project is marked as delayed:' | t }} {{ p.delay | t }}.</div>
      }

      <div class="two-col">
        <div class="card pad">
          <h3 class="card-title">{{ 'Project information' | t }}</h3>
          <dl class="details one">
            <div><dt>{{ 'Project ID' | t }}</dt><dd>{{ p.id }}</dd></div>
            <div><dt>{{ 'Status' | t }}</dt><dd><app-status-badge [status]="p.status" /></dd></div>
            <div><dt>{{ 'Description' | t }}</dt><dd>{{ p.description }}</dd></div>
            <div><dt>{{ 'Project manager' | t }}</dt><dd>{{ p.manager }}</dd></div>
            <div><dt>{{ 'Planned start' | t }}</dt><dd>{{ p.plannedStart }}</dd></div>
            <div><dt>{{ 'Planned completion' | t }}</dt><dd>{{ p.plannedFinish }}</dd></div>
            <div><dt>{{ 'Actual start' | t }}</dt><dd>{{ p.actualStart }}</dd></div>
            <div><dt>{{ 'Actual completion' | t }}</dt><dd>{{ p.actualFinish }}</dd></div>
            <div><dt>{{ 'Delay information' | t }}</dt><dd>{{ p.delay | t }}</dd></div>
          </dl>
        </div>
        <div class="stack">
          <div class="card pad">
            <h3 class="card-title">{{ 'Progress' | t }}</h3>
            <div class="bar-top"><span>{{ 'Completed' | t }}</span><span>{{ p.progress }}%</span></div>
            <div class="progress big"><span [style.width.%]="p.progress"></span></div>
          </div>
          <div class="card pad">
            <h3 class="card-title">{{ 'Assigned team members' | t }}</h3>
            <ul class="feed">
              @for (m of p.team; track m) { <li><div><strong>{{ m }}</strong></div></li> }
            </ul>
          </div>
        </div>
      </div>

      <div class="card pad mt">
        <h3 class="card-title">{{ 'Related activity reports' | t }}</h3>
        @if (related.length) {
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th scope="col">{{ 'Report' | t }}</th><th scope="col">{{ 'Employee' | t }}</th><th scope="col">{{ 'Activity status' | t }}</th><th scope="col">{{ 'Review status' | t }}</th><th scope="col">{{ 'Submitted' | t }}</th></tr></thead>
              <tbody>
                @for (r of related; track r.id) {
                  <tr>
                    <td [attr.data-label]="'Report' | t"><a class="link" [routerLink]="[auth.base(), 'reports', r.id]">{{ r.id }}</a></td>
                    <td [attr.data-label]="'Employee' | t">{{ r.employee }}</td>
                    <td [attr.data-label]="'Activity status' | t"><app-status-badge [status]="entryStatus(r)" /></td>
                    <td [attr.data-label]="'Review status' | t"><app-status-badge [status]="r.reviewStatus" /></td>
                    <td [attr.data-label]="'Submitted' | t">{{ r.submittedAt }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else { <app-empty-state message="No activity reports have been submitted for this project yet." /> }
      </div>
    } @else {
      <app-empty-state message="Project not found." />
    }`
})
export class ProjectDetailsComponent implements OnInit {
  auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  p: any = null;
  related: any[] = [];
  entryStatus(r: any) { return r.entries.find((e: any) => e.projectId === this.p.id)?.activityStatus ?? ''; }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.p = PROJECTS.find(x => x.id === id) ?? null;
    if (this.p) {
      const me = this.auth.fullName(); const role = this.auth.role();
      this.related = REPORTS.filter(r => r.entries.some((e: any) => e.projectId === this.p.id) && ((role === 'employee' || role === 'intern') ? r.employee === me : true));
    }
  }
}
