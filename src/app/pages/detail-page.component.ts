import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { DetailData, detailFor } from '../core/mock-data';
import { PageHeaderComponent } from '../shared/page-header.component';
import { StatusBadgeComponent } from '../shared/status-badge.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { IconComponent } from '../shared/icon.component';
import { TPipe } from '../shared/t.pipe';

@Component({
  selector: 'app-detail-page',
  standalone: true,
  imports: [TPipe, RouterLink, PageHeaderComponent, StatusBadgeComponent, EmptyStateComponent, IconComponent],
  template: `
    @if (d) {
      <app-page-header [title]="d.title" [crumbs]="d.crumbs">
        <a class="btn btn-outline" [routerLink]="resolve(d.backLink)"><app-icon name="chevron-left" /> {{ 'Back' | t }}</a>
        @if (d.editLink) { <a class="btn btn-primary" [routerLink]="resolve(d.editLink)"><app-icon name="edit" /> {{ 'Edit' | t }}</a> }
      </app-page-header>
      <div class="card pad">
        <dl class="details">
          @for (f of d.fields; track f.label) {
            <div><dt>{{ f.label | t }}</dt><dd>@if (f.badge) { <app-status-badge [status]="f.value" /> } @else { {{ (f.value ?? '—') | t }} }</dd></div>
          }
        </dl>
      </div>
    } @else {
      <app-empty-state message="This record could not be found." />
    }`
})
export class DetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  d: DetailData | null = null;
  ngOnInit() {
    this.d = detailFor(this.route.snapshot.data['entity'], this.route.snapshot.paramMap.get('id'), this.auth.user()!);
  }
  resolve(t: string) { return t.replace('{base}', this.auth.base()); }
}
