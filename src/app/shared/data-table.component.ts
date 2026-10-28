import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from './icon.component';
import { TPipe } from './t.pipe';
import { I18nService } from '../core/i18n.service';
import { StatusBadgeComponent } from './status-badge.component';
import { EmptyStateComponent } from './empty-state.component';
import { Column, FilterDef, RowAction } from '../core/list-configs';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [FormsModule, TPipe, IconComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div class="card table-card">
      <div class="toolbar">
        <label class="search-box">
          <app-icon name="search" />
          <input type="search" [placeholder]="searchPlaceholder | t" [ngModel]="search()" (ngModelChange)="setSearch($event)" [attr.aria-label]="'Search records' | t" />
        </label>
        @for (f of filters; track f.key) {
          <select class="select" [attr.aria-label]="f.label | t" [ngModel]="fv()[f.key] || ''" (ngModelChange)="setFilter(f.key, $event)">
            <option value="">{{ f.label | t }}: {{ 'All' | t }}</option>
            @for (o of f.options; track o) { <option [value]="o">{{ o | t }}</option> }
          </select>
        }
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              @for (c of columns; track c.key) {
                <th scope="col">
                  <button type="button" class="th-btn" (click)="sortBy(c.key)">
                    {{ c.label | t }}
                    @if (sortKey() === c.key) { <span aria-hidden="true">{{ sortDir() === 'asc' ? '▲' : '▼' }}</span> }
                  </button>
                </th>
              }
              @if (actions.length) { <th scope="col">{{ 'Actions' | t }}</th> }
            </tr>
          </thead>
          <tbody>
            @if (loading) {
              <tr><td [attr.colspan]="colSpan()"><div class="loading"><span class="spinner"></span> {{ 'Loading...' | t }}</div></td></tr>
            } @else if (paged().length === 0) {
              <tr><td [attr.colspan]="colSpan()"><app-empty-state [message]="emptyMessage" /></td></tr>
            } @else {
              @for (row of paged(); track $index) {
                <tr>
                  @for (c of columns; track c.key) {
                    <td [attr.data-label]="c.label | t">
                      @switch (c.type) {
                        @case ('badge') { <app-status-badge [status]="row[c.key]" /> }
                        @case ('tags') { <div class="tags">@for (p of row[c.key].slice(0, 2); track p) { <span class="tag">{{ p | t }}</span> }@if (row[c.key].length > 2) { <span class="tag more" [attr.title]="row[c.key].join(', ')">+{{ row[c.key].length - 2 }}</span> }</div> }
                        @case ('progress') {
                          <div class="progress-cell">
                            <div class="progress"><span [style.width.%]="row[c.key]"></span></div>
                            <small>{{ row[c.key] }}%</small>
                          </div>
                        }
                        @default { <span>{{ (row[c.key] ?? '—') | t }}</span> }
                      }
                    </td>
                  }
                  @if (actions.length) {
                    <td class="row-actions" [attr.data-label]="'Actions' | t">
                      @for (a of actions; track a.key) {
                        @if (!a.when || a.when(row)) {
                          <button type="button" class="icon-act" [class.danger]="a.danger" [attr.data-tip]="a.label | t" [attr.title]="a.label | t" [attr.aria-label]="a.label | t" (click)="action.emit({ key: a.key, row: row })">
                            <app-icon [name]="a.icon" /><span class="act-label">{{ a.label | t }}</span>
                          </button>
                        }
                      }
                    </td>
                  }
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <div class="pager">
        <span class="muted">{{ rangeText() }}</span>
        <div class="pager-btns">
          <button type="button" class="btn btn-sm btn-outline" [disabled]="page() === 1" (click)="go(page() - 1)" [attr.aria-label]="'Previous page' | t"><app-icon name="chevron-left" /></button>
          @for (p of pages(); track p) {
            <button type="button" class="btn btn-sm" [class.btn-primary]="p === page()" [class.btn-outline]="p !== page()" [attr.aria-current]="p === page() ? 'page' : null" (click)="go(p)">{{ p }}</button>
          }
          <button type="button" class="btn btn-sm btn-outline" [disabled]="page() === totalPages()" (click)="go(page() + 1)" [attr.aria-label]="'Next page' | t"><app-icon name="chevron-right" /></button>
        </div>
      </div>
    </div>`
})
export class DataTableComponent {
  @Input() columns: Column[] = [];
  @Input() filters: FilterDef[] = [];
  @Input() actions: RowAction[] = [];
  @Input() searchPlaceholder = 'Search...';
  @Input() emptyMessage = 'No records found.';
  @Input() loading = false;
  /** Extra fields (not shown as columns) that the search box also looks into. */
  @Input() searchExtra: string[] = [];
  @Input() pageSize = 6;
  @Input() set initialSearch(v: string) { this.search.set(v || ''); this.page.set(1); }
  @Input() set rows(v: any[]) { this._rows.set(v || []); this.page.set(1); }
  @Output() action = new EventEmitter<{ key: string; row: any }>();

  private i18n = inject(I18nService);
  private _rows = signal<any[]>([]);
  search = signal('');
  fv = signal<Record<string, string>>({});
  page = signal(1);
  sortKey = signal('');
  sortDir = signal<'asc' | 'desc'>('asc');

  filtered = computed(() => {
    let r = this._rows();
    const q = this.search().toLowerCase().trim();
    if (q) { const keys = [...this.columns.map(c => c.key), ...this.searchExtra]; r = r.filter(row => keys.some(k => String(row[k] ?? '').toLowerCase().includes(q))); }
    const f = this.fv();
    for (const k of Object.keys(f)) { if (f[k]) r = r.filter(row => row[k] === f[k]); }
    const sk = this.sortKey();
    if (sk) {
      const dir = this.sortDir() === 'asc' ? 1 : -1;
      r = [...r].sort((a, b) => String(a[sk] ?? '').localeCompare(String(b[sk] ?? ''), undefined, { numeric: true }) * dir);
    }
    return r;
  });
  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  paged = computed(() => { const s = (this.page() - 1) * this.pageSize; return this.filtered().slice(s, s + this.pageSize); });
  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
  rangeText = computed(() => {
    const n = this.filtered().length;
    if (!n) return this.i18n.t('No results');
    const s = (this.page() - 1) * this.pageSize;
    return this.i18n.t('Showing {a}-{b} of {n}', { a: s + 1, b: Math.min(s + this.pageSize, n), n });
  });

  colSpan() { return this.columns.length + (this.actions.length ? 1 : 0); }
  setSearch(v: string) { this.search.set(v || ''); this.page.set(1); }
  setFilter(k: string, v: string) { this.fv.update(o => ({ ...o, [k]: v })); this.page.set(1); }
  sortBy(k: string) {
    if (this.sortKey() === k) this.sortDir.update(d => (d === 'asc' ? 'desc' : 'asc'));
    else { this.sortKey.set(k); this.sortDir.set('asc'); }
  }
  go(p: number) { this.page.set(Math.min(Math.max(1, p), this.totalPages())); }
}
