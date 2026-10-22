import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ConfirmService } from '../core/confirm.service';
import { ToastService } from '../core/toast.service';
import { LIST_CONFIGS, ListConfig } from '../core/list-configs';
import { dataFor } from '../core/mock-data';
import { PageHeaderComponent } from '../shared/page-header.component';
import { DataTableComponent } from '../shared/data-table.component';
import { IconComponent } from '../shared/icon.component';
import { TPipe } from '../shared/t.pipe';
import { I18nService } from '../core/i18n.service';

@Component({
  selector: 'app-list-page',
  standalone: true,
  imports: [TPipe, RouterLink, PageHeaderComponent, DataTableComponent, IconComponent],
  template: `
    @if (cfg) {
      <app-page-header [title]="cfg.title" [crumbs]="cfg.crumbs">
        @if (cfg.createLink) {
          <a class="btn btn-primary" [routerLink]="resolve(cfg.createLink)"><app-icon name="plus" />{{ cfg.createLabel | t }}</a>
        }
      </app-page-header>
      <app-data-table
        [columns]="cfg.columns" [filters]="cfg.filters || []" [actions]="cfg.actions || []"
        [rows]="rows()" [loading]="loading()" [searchPlaceholder]="cfg.searchPlaceholder"
        [emptyMessage]="cfg.emptyMessage" [initialSearch]="q()" (action)="onAction($event)" />
    }`
})
export class ListPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);
  private i18n = inject(I18nService);

  cfg!: ListConfig;
  entity = '';
  rows = signal<any[]>([]);
  loading = signal(true);
  q = signal('');

  ngOnInit() {
    this.entity = this.route.snapshot.data['entity'];
    this.cfg = LIST_CONFIGS[this.entity];
    this.rows.set(dataFor(this.entity, this.auth.user()!));
    this.route.queryParamMap.subscribe(p => this.q.set(p.get('q') || ''));
    setTimeout(() => this.loading.set(false), 500); // simulated request
  }

  resolve(t: string, row?: any) {
    return t.replace('{base}', this.auth.base()).replace('{id}', row ? String(row.id) : '');
  }

  private patch(row: any, changes: any) { this.rows.update(rs => rs.map(r => (r === row ? { ...r, ...changes } : r))); }

  async onAction(e: { key: string; row: any }) {
    const a = this.cfg.actions?.find(x => x.key === e.key);
    if (a?.link) { this.router.navigateByUrl(this.resolve(a.link, e.row)); return; }
    const name = e.row.name ?? e.row.invitee ?? e.row.id;
    switch (e.key) {
      case 'suspend':
        if (await this.confirm.ask({ title: 'Suspend enterprise', message: this.i18n.t('Are you sure you want to suspend {name}? Its users will lose access until it is reactivated.', { name }), confirmLabel: 'Suspend', danger: true })) {
          this.patch(e.row, { status: 'Suspended' }); this.toast.warning(this.i18n.t('{name} has been suspended.', { name }));
        }
        break;
      case 'deactivate':
        if (await this.confirm.ask({ title: 'Deactivate user', message: this.i18n.t('Are you sure you want to deactivate {name}? They will no longer be able to log in.', { name }), confirmLabel: 'Deactivate', danger: true })) {
          this.patch(e.row, { status: 'Inactive' }); this.toast.warning(this.i18n.t('{name} has been deactivated.', { name }));
        }
        break;
      case 'activate':
        this.patch(e.row, { status: 'Active' }); this.toast.success(this.i18n.t('{name} is now active.', { name }));
        break;
      case 'resend':
        this.patch(e.row, { status: 'Pending' }); this.toast.info(this.i18n.t('Invitation resent to {email}.', { email: e.row.email }));
        break;
      case 'revoke':
        if (await this.confirm.ask({ title: 'Revoke invitation', message: this.i18n.t('Are you sure you want to revoke the invitation sent to {email}?', { email: e.row.email }), confirmLabel: 'Revoke', danger: true })) {
          this.patch(e.row, { status: 'Revoked' }); this.toast.warning('Invitation revoked.');
        }
        break;
    }
  }
}
