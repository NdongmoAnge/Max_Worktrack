import { Component, Input } from '@angular/core';
import { TPipe } from './t.pipe';


@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [TPipe],
  template: `
    <div class="page-head">
      <div>
        <h1>{{ title | t }}</h1>
        <nav class="crumbs" aria-label="Breadcrumb">
          @for (c of crumbs; track $index) {
            <span>{{ c | t }}</span>
            @if (!$last) { <span class="sep">/</span> }
          }
        </nav>
      </div>
      <div class="page-actions"><ng-content /></div>
    </div>`
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() crumbs: string[] = [];
}
