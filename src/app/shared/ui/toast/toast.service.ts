import { Injectable, signal } from '@angular/core';

export interface ToastState {
  message: string;
  busy: boolean;
}

/** Aviso flotante (esquina inferior derecha) usado para descargas y confirmaciones. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly current = signal<ToastState | null>(null);
  private timers: ReturnType<typeof setTimeout>[] = [];

  show(message: string, duration = 2400): void {
    this.clearTimers();
    this.current.set({ message, busy: false });
    this.timers.push(setTimeout(() => this.current.set(null), duration));
  }

  /** Simula la generación de un archivo: «Generando X…» y luego «X descargado». */
  download(fileName: string): void {
    this.clearTimers();
    this.current.set({ message: `Generando ${fileName}…`, busy: true });
    this.timers.push(
      setTimeout(() => this.current.set({ message: `${fileName} descargado`, busy: false }), 1300),
      setTimeout(() => this.current.set(null), 3600),
    );
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
