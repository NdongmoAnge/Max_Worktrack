import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions { title: string; message: string; confirmLabel?: string; danger?: boolean; }
export interface ConfirmState extends ConfirmOptions { resolve: (v: boolean) => void; }

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  state = signal<ConfirmState | null>(null);

  ask(o: ConfirmOptions): Promise<boolean> {
    return new Promise<boolean>(resolve => this.state.set({ ...o, resolve }));
  }
  answer(v: boolean) {
    const s = this.state();
    if (s) { this.state.set(null); s.resolve(v); }
  }
}
