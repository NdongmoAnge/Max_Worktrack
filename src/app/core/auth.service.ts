import { Injectable, computed, inject, signal } from '@angular/core';
import { Role, ROLE_BASE, User } from './models';
import { ACCOUNTS, ENTERPRISES, USERS, effectiveStatus, saveInvitations, saveUsers, storedAccounts } from './mock-data';
import { I18nService, Lang } from './i18n.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private i18n = inject(I18nService);
  private _user = signal<User | null>(this.load());
  user = this._user.asReadonly();
  role = computed<Role | null>(() => this._user()?.role ?? null);
  base = computed(() => (this._user() ? ROLE_BASE[this._user()!.role] : '/login'));
  fullName = computed(() => (this._user() ? this._user()!.firstName + ' ' + this._user()!.lastName : ''));
  initials = computed(() => (this._user() ? (this._user()!.firstName[0] + this._user()!.lastName[0]).toUpperCase() : ''));

  private _avatars = signal<Record<string, string>>(this.loadAvatars());
  /** Profile picture (data URL) of the logged-in user, or null. */
  avatar = computed<string | null>(() => (this._user() ? this._avatars()[this._user()!.email] ?? null : null));

  private loadAvatars(): Record<string, string> {
    try { return JSON.parse(localStorage.getItem('rms_avatars') || '{}'); } catch { return {}; }
  }
  setAvatar(dataUrl: string | null) {
    const u = this._user(); if (!u) return;
    this._avatars.update(a => { const n = { ...a }; dataUrl ? (n[u.email] = dataUrl) : delete n[u.email]; return n; });
    try { localStorage.setItem('rms_avatars', JSON.stringify(this._avatars())); } catch {}
  }

  constructor() {
    const u = this._user();
    if (u) this.i18n.setUser(u.email, this.companyLang(u)); // restore language of a returning session
  }

  /** Default language chosen by the Super Admin for the user's enterprise. */
  private companyLang(u: User): Lang | null {
    const e = ENTERPRISES.find(x => x.name === u.enterprise);
    return e ? (e.defaultLanguage === 'French' ? 'fr' : 'en') : null;
  }

  private load(): User | null {
    try { const r = localStorage.getItem('rms_user'); return r ? JSON.parse(r) : null; } catch { return null; }
  }
  private set(u: User | null) {
    this._user.set(u);
    this.i18n.setUser(u ? u.email : null, u ? this.companyLang(u) : null);
    try { u ? localStorage.setItem('rms_user', JSON.stringify(u)) : localStorage.removeItem('rms_user'); } catch {}
  }

  /** Checks the e-mail and password. (Sample accounts + accounts created from invitations; the back end will replace this.) */
  login(email: string, password: string): boolean {
    const e = email.trim().toLowerCase();
    let found: User | null = null;
    const seed = ACCOUNTS.find(a => a.email.toLowerCase() === e);
    if (seed) {
      if (seed.password === password) { const { password: _p, ...u } = seed; found = u; }
    } else {
      const acc = storedAccounts()[e];
      if (acc && acc.password === password) found = acc.user;
    }
    if (!found) return false;
    this.set(found);
    return true;
  }

  /** Accept an invitation: create the account with the password the person chose. */
  activate(inv: any, password: string): boolean {
    if (!inv || effectiveStatus(inv) !== 'Pending') return false;
    const email = String(inv.email).toLowerCase();
    const roles: Record<string, Role> = { 'Company Admin': 'company_admin', 'Branch Manager': 'branch_manager', 'Employee': 'employee', 'Intern': 'intern' };
    const user: User = { id: Date.now() % 1000000, firstName: inv.firstName, lastName: inv.lastName, email, role: roles[inv.role] ?? 'employee', enterprise: inv.enterprise, branch: inv.branch };
    const accounts = storedAccounts(); accounts[email] = { password, user };
    try { localStorage.setItem('rms_accounts', JSON.stringify(accounts)); } catch {}
    inv.status = 'Accepted'; saveInvitations();
    const row = USERS.find(u => String(u.email).toLowerCase() === email);
    if (row) { row.invitation = 'Accepted'; saveUsers(); }
    return true;
  }

  logout() { this.set(null); }
}
