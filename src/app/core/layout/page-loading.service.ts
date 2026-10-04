import { DestroyRef, Injectable, Signal, effect, inject, signal } from '@angular/core';

/** Controla la barra de progreso que el layout muestra bajo el encabezado. */
@Injectable({ providedIn: 'root' })
export class PageLoadingService {
  readonly label = signal<string | null>(null);

  /**
   * Muestra la barra mientras `loading` sea verdadero y la oculta al destruir
   * el componente. Debe llamarse en un contexto de inyección.
   */
  bind(loading: Signal<boolean>, label: Signal<string> | string): void {
    effect(() => {
      const text = typeof label === 'string' ? label : label();
      this.label.set(loading() ? text : null);
    });
    inject(DestroyRef).onDestroy(() => this.label.set(null));
  }
}
