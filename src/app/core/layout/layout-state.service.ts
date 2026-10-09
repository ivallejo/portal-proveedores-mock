import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/** Estado del layout que comparten el shell, el encabezado y el menú lateral. Se provee en el shell. */
@Injectable()
export class LayoutStateService {
  readonly isDesktop = signal(typeof window === 'undefined' || window.innerWidth >= 1024);
  /** En escritorio el menú está visible por defecto; en móvil es un panel deslizable. */
  readonly navOpen = signal(this.isDesktop());

  constructor() {
    // En móvil el menú se cierra al navegar.
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => {
        if (!this.isDesktop()) this.navOpen.set(false);
      });
    if (typeof window !== 'undefined') {
      const query = window.matchMedia('(min-width: 1024px)');
      query.addEventListener('change', (event) => {
        this.isDesktop.set(event.matches);
        this.navOpen.set(event.matches);
      });
    }
  }

  toggleNav(): void {
    this.navOpen.update((open) => !open);
  }
}
