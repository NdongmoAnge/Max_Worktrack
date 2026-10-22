import { Injectable, signal } from '@angular/core';

export interface Toast { id: number; type: 'success' | 'error' | 'warning' | 'info'; message: string; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private n = 0;

  show(type: Toast['type'], message: string, ms = 4500) {
    const id = ++this.n;
    this.toasts.update(t => [...t, { id, type, message }]);
    setTimeout(() => this.dismiss(id), ms);
  }
  success(m: string) { this.show('success', m); }
  error(m: string) { this.show('error', m); }
  warning(m: string) { this.show('warning', m); }
  info(m: string) { this.show('info', m); }
  dismiss(id: number) { this.toasts.update(t => t.filter(x => x.id !== id)); }
}
