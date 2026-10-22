import { Injectable, computed, signal } from '@angular/core';
import { Role, ROLE_BASE, User } from './models';
import { DEMO_USERS } from './mock-data';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(this.load());
  user = this._user.asReadonly();
  role = computed<Role | null>(() => this._user()?.role ?? null);
  base = computed(() => (this._user() ? ROLE_BASE[this._user()!.role] : '/login'));
  fullName = computed(() => (this._user() ? this._user()!.firstName + ' ' + this._user()!.lastName : ''));
  initials = computed(() => (this._user() ? (this._user()!.firstName[0] + this._user()!.lastName[0]).toUpperCase() : ''));

  private load(): User | null {
    try { const r = localStorage.getItem('rms_user'); return r ? JSON.parse(r) : null; } catch { return null; }
  }
  private set(u: User | null) {
    this._user.set(u);
    try { u ? localStorage.setItem('rms_user', JSON.stringify(u)) : localStorage.removeItem('rms_user'); } catch {}
  }

  /** Sample-data login. The back end will replace this later. Any non-empty password works. */
  login(email: string, password: string): boolean {
    const u = DEMO_USERS.find(d => d.email === email.trim().toLowerCase());
    if (!u || !password) return false;
    this.set(u);
    return true;
  }
  loginAs(role: Role) {
    const u = DEMO_USERS.find(d => d.role === role)!;
    this.set(u);
  }
  logout() { this.set(null); }
}
