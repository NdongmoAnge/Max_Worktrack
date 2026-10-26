import { Component, Input, inject } from '@angular/core';
import { AuthService } from '../core/auth.service';

/** The logged-in user's profile picture, or their initials when none was added. */
@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `<span class="avatar" [class.xl]="size === 'xl'">@if (auth.avatar()) { <img [src]="auth.avatar()" alt="" /> } @else { {{ auth.initials() }} }</span>`
})
export class AvatarComponent {
  auth = inject(AuthService);
  @Input() size: 'md' | 'xl' = 'md';
}
