import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, firstValueFrom, map, of, shareReplay, tap } from 'rxjs';
import { GET_NAVIGATION } from '../../di/menus.tokens';
import { NavigationItem } from '../../domain/models/navigation-item';
import { allowsPath, routesOf } from '../../domain/rules/navigation-rules';

/** Menú de la sesión. Las rutas que muestra son las que el usuario puede abrir. */
@Injectable({ providedIn: 'root' })
export class SessionMenuFacade {
  private readonly getNavigation = inject(GET_NAVIGATION);
  private pending: Observable<NavigationItem[]> | null = null;

  readonly items = signal<NavigationItem[] | null>(null);
  readonly routes = computed(() => routesOf(this.items() ?? []));

  /** Carga el menú una vez por sesión (o de nuevo tras `reset`). Si falla, el menú queda vacío. */
  load(): Observable<NavigationItem[]> {
    const loaded = this.items();
    if (loaded) return of(loaded);
    this.pending ??= this.getNavigation.execute().pipe(
      catchError(() => of([] as NavigationItem[])),
      tap((items) => {
        this.items.set(items);
        this.pending = null;
      }),
      shareReplay(1),
    );
    return this.pending;
  }

  /** Recarga el menú (por ejemplo, después de cambiar los permisos del propio rol). */
  refresh(): void {
    this.reset();
    this.load().subscribe();
  }

  reset(): void {
    this.items.set(null);
    this.pending = null;
  }

  /** La ruta (o una de sus subrutas) está en el menú del usuario. */
  async allows(path: string): Promise<boolean> {
    const routes = await firstValueFrom(this.load().pipe(map(() => this.routes())));
    return allowsPath(routes, path);
  }
}
