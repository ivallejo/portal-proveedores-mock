import { WritableSignal } from '@angular/core';

/** Marca una fila como recién guardada (`.row-flash`) y la desmarca cuando termina la animación. */
export function flashRow(target: WritableSignal<string | null>, id: string, ms = 2400): void {
  target.set(id);
  setTimeout(() => {
    if (target() === id) target.set(null);
  }, ms);
}
