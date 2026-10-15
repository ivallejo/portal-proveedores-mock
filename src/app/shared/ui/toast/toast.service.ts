import { Injectable, signal } from '@angular/core';
import { ToastOptions } from './toast-options';
import { ToastState } from './toast-state';

/** Duración M3 de un aviso: entre 4 y 10 s según lo que haya que leer; con acción, al menos 6 s. */
function readingTime(message: string, hasAction: boolean): number {
  const byLength = 2000 + message.length * 60;
  return Math.min(10_000, Math.max(hasAction ? 6000 : 4000, byLength));
}

/**
 * Aviso flotante (snackbar M3) para descargas, confirmaciones y errores: abajo a la derecha en escritorio
 * y a lo ancho, abajo, en móvil.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly current = signal<ToastState | null>(null);
  private timers: ReturnType<typeof setTimeout>[] = [];

  /** `options` acepta también un número (duración mínima en ms), como antes. */
  show(message: string, options: number | ToastOptions = {}): void {
    const {
      duration = 0,
      tone = 'success',
      action,
    } = typeof options === 'number' ? { duration: options } : options;
    this.clearTimers();
    this.current.set({ message, busy: false, tone, action });
    const ms = Math.max(duration, readingTime(message, !!action));
    this.timers.push(setTimeout(() => this.current.set(null), ms));
  }

  /** Simula la generación de un archivo: «Generando X…» y luego «X descargado». */
  download(fileName: string): void {
    this.clearTimers();
    this.current.set({ message: `Generando ${fileName}…`, busy: true, tone: 'info' });
    this.timers.push(
      setTimeout(
        () => this.current.set({ message: `${fileName} descargado`, busy: false, tone: 'success' }),
        1300,
      ),
      setTimeout(() => this.current.set(null), 1300 + readingTime(`${fileName} descargado`, false)),
    );
  }

  /** Ejecuta la acción del aviso y lo cierra. */
  runAction(): void {
    const action = this.current()?.action;
    this.dismiss();
    action?.run();
  }

  dismiss(): void {
    this.clearTimers();
    this.current.set(null);
  }

  private clearTimers(): void {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }
}
