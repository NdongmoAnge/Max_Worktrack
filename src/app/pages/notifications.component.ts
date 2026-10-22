import { Component, signal } from '@angular/core';
import { NOTIFICATIONS } from '../core/mock-data';
import { PageHeaderComponent } from '../shared/page-header.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { IconComponent } from '../shared/icon.component';
import { TPipe } from '../shared/t.pipe';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [TPipe, PageHeaderComponent, EmptyStateComponent, IconComponent],
  template: `
    <app-page-header title="Notifications" [crumbs]="['Notifications']">
      <button type="button" class="btn btn-outline" (click)="markAll()"><app-icon name="check" /> {{ 'Mark all as read' | t }}</button>
    </app-page-header>
    <div class="card pad">
      <ul class="feed notif">
        @for (n of items(); track n.id) {
          <li [class.unread]="!n.read">
            <span [class]="'notif-ico t-' + n.type"><app-icon [name]="n.type === 'success' ? 'check' : n.type === 'warning' ? 'alert' : 'info'" /></span>
            <div><strong>{{ n.message | t }}</strong><small>{{ n.time | t }}@if (!n.read) { - {{ 'Unread' | t }} }</small></div>
          </li>
        } @empty { <li><app-empty-state message="You have no notifications." icon="bell" /></li> }
      </ul>
    </div>`
})
export class NotificationsComponent {
  items = signal(NOTIFICATIONS.map(n => ({ ...n })));
  markAll() { this.items.update(l => l.map(n => ({ ...n, read: true }))); }
}
