import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { I18nService } from '../core/i18n.service';
import { ScheduleService } from '../core/schedule.service';
import { toIso } from '../core/report-rules';
import { buildDashboard, Slice } from '../core/dashboard.config';
import { PageHeaderComponent } from '../shared/page-header.component';
import { StatCardComponent } from '../shared/stat-card.component';
import { AreaChartComponent } from '../shared/area-chart.component';
import { StatusBadgeComponent } from '../shared/status-badge.component';
import { IconComponent } from '../shared/icon.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { TPipe } from '../shared/t.pipe';

const COLORS = ['#0a0af0', '#0a0a0a', '#8c8cff', '#c9c9d6', '#4b4bff'];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TPipe, RouterLink, PageHeaderComponent, StatCardComponent, AreaChartComponent, StatusBadgeComponent, IconComponent, EmptyStateComponent],
  template: `
    @if (cfgS(); as cfg) {
      <app-page-header [title]="cfg.title" [crumbs]="['Dashboard']">
        @for (a of cfg.actions; track a.label) {
          <a class="btn btn-outline" [routerLink]="resolve(a.link)"><app-icon [name]="a.icon" />{{ a.label | t }}</a>
        }
      </app-page-header>
      <section class="hero">
        <span class="hero-orb o1"></span><span class="hero-orb o2"></span><span class="hero-orb o3"></span>
        <div class="hero-text">
          <h2>{{ greeting() }}</h2>
          <p>{{ cfg.subtitle | t }}</p>
          @if (cfg.banner) { <span class="hero-chip"><app-icon name="info" /> {{ cfg.banner.label | t }}: {{ cfg.banner.value | t }}</span> }
        </div>
        <div class="hero-date"><app-icon name="clock" /> {{ todayLabel() }}</div>
      </section>

      <div class="dash-grid">
        <div class="dash-left">
          <div class="stat-grid">
            @for (s of cfg.stats; track s.label) {
              <app-stat-card [label]="s.label" [value]="s.value" [icon]="s.icon" [sub]="s.sub || ''" [highlight]="!!s.highlight" />
            }
          </div>
          <div class="card pad">
            <h3 class="card-title">{{ cfg.chart.title | t }}</h3>
            <app-area-chart [data]="cfg.chart.data" [labels]="cfg.chart.labels" />
          </div>
          <div class="card pad">
            <h3 class="card-title">{{ monthLabel() }}</h3>
            <div class="week" role="list">
              @for (d of week(); track d.day) {
                <div class="day" role="listitem" [class.today]="d.today">
                  <small>{{ d.dow }}</small><strong>{{ d.day }}</strong>
                  @if (d.report) { <em>{{ 'Report day' | t }}</em> }
                </div>
              }
            </div>
          </div>
        </div>

        <div class="dash-right">
          <div class="card pad">
            <h3 class="card-title">{{ cfg.donut.title | t }}</h3>
            @if (total(cfg.donut.slices) > 0) {
              <div class="donut-wrap">
                <div class="donut" [style.background]="donutBg(cfg.donut.slices)" role="img" [attr.aria-label]="cfg.donut.title | t">
                  <div class="donut-hole"><small>{{ 'Total' | t }}</small><strong>{{ total(cfg.donut.slices) }}</strong></div>
                </div>
                <ul class="legend">
                  @for (s of cfg.donut.slices; track s.label; let i = $index) {
                    <li><i class="lg-dot" [style.background]="color(i)"></i>{{ s.label | t }} <b>{{ s.value }}</b></li>
                  }
                </ul>
              </div>
            } @else { <app-empty-state message="No data yet." /> }
          </div>
          <div class="card pad">
            <h3 class="card-title">{{ cfg.bars.title | t }}</h3>
            @for (b of cfg.bars.items; track b.label) {
              <div class="bar-row">
                <div class="bar-top"><span>{{ b.label | t }}</span><span>{{ b.text }}</span></div>
                <div class="progress"><span [style.width.%]="b.value"></span></div>
              </div>
            } @empty { <app-empty-state message="No data yet." /> }
          </div>
        </div>
      </div>

      <div class="dash-bottom">
        <div class="card pad">
          <div class="card-head"><h3 class="card-title">{{ cfg.recent.title | t }}</h3><a class="link" [routerLink]="resolve(cfg.recent.link)">{{ cfg.recent.linkLabel | t }}</a></div>
          <div class="table-wrap">
            <table class="table">
              <thead><tr>@for (c of cfg.recent.columns; track c.key) { <th scope="col">{{ c.label | t }}</th> }</tr></thead>
              <tbody>
                @for (r of cfg.recent.rows; track $index) {
                  <tr>
                    @for (c of cfg.recent.columns; track c.key) {
                      <td [attr.data-label]="c.label | t">
                        @if (c.type === 'badge') { <app-status-badge [status]="r[c.key]" /> } @else if (c.type === 'tags') { <div class="tags">@for (p of r[c.key]; track p) { <span class="tag">{{ p | t }}</span> }</div> } @else { {{ (r[c.key] ?? '—') | t }} }
                      </td>
                    }
                  </tr>
                } @empty { <tr><td [attr.colspan]="cfg.recent.columns.length"><app-empty-state message="Nothing to show yet." /></td></tr> }
              </tbody>
            </table>
          </div>
        </div>
        <div class="card pad">
          <h3 class="card-title">{{ cfg.list.title | t }}</h3>
          <ul class="feed">
            @for (i of cfg.list.items; track $index) {
              <li><div><strong>{{ i.primary }}</strong><small>{{ i.secondary }}</small></div>@if (i.badge) { <app-status-badge [status]="i.badge" /> }</li>
            } @empty { <li><app-empty-state [message]="cfg.list.empty" icon="check-square" /></li> }
          </ul>
        </div>
      </div>
    }`
})
export class DashboardComponent {
  private auth = inject(AuthService);
  private i18n = inject(I18nService);
  private schedule = inject(ScheduleService);
  first = this.auth.user()!.firstName;

  /** Rebuilt whenever the language changes (month names, dates, composed sentences). */
  private isWorker() { return this.auth.role() === 'employee' || this.auth.role() === 'intern'; }
  private reportDate() { return this.isWorker() ? this.schedule.nextFor(this.auth.fullName()) : undefined; }
  cfgS = computed(() => { this.i18n.lang(); return buildDashboard(this.auth.role()!, this.auth.user()!, (s, p) => this.i18n.t(s, p), this.i18n.locale, this.reportDate()); });
  greeting = computed(() => {
    this.i18n.lang();
    const h = new Date().getHours();
    const key = h < 12 ? 'Good morning, {name}!' : h < 18 ? 'Good afternoon, {name}!' : 'Good evening, {name}!';
    return this.i18n.t(key, { name: this.first });
  });
  todayLabel = computed(() => { this.i18n.lang(); return new Date().toLocaleDateString(this.i18n.locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); });
  monthLabel = computed(() => { this.i18n.lang(); return new Date().toLocaleDateString(this.i18n.locale, { month: 'long', year: 'numeric' }); });
  week = computed(() => {
    this.i18n.lang();
    const rd = this.reportDate();
    const t = new Date();
    const mon = new Date(t); mon.setDate(t.getDate() - ((t.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mon); d.setDate(mon.getDate() + i);
      return { dow: d.toLocaleDateString(this.i18n.locale, { weekday: 'short' }), day: d.getDate(), today: d.toDateString() === t.toDateString(), report: toIso(d) === rd };
    });
  });

  resolve(t: string) { return t.replace('{base}', this.auth.base()); }
  color(i: number) { return COLORS[i % COLORS.length]; }
  total(s: Slice[]) { return s.reduce((a, b) => a + b.value, 0); }
  donutBg(s: Slice[]) {
    const t = this.total(s) || 1; let acc = 0;
    const parts = s.map((x, i) => { const from = acc; acc += (x.value / t) * 100; return COLORS[i % COLORS.length] + ' ' + from + '% ' + acc + '%'; });
    return 'conic-gradient(' + parts.join(', ') + ')';
  }
}
