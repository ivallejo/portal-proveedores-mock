import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, firstValueFrom, map, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Opción del menú lateral según el rol de la sesión (Configuración › Roles y permisos). */
export interface NavItem {
  code: string;
  name: string;
  route: string | null;
  icon: string;
  children: NavItem[];
}

/** Menú de la sesión, leído de `api/navigation`. Las rutas que muestra son las que el usuario puede abrir. */
@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly http = inject(HttpClient);
  private pending: Observable<NavItem[]> | null = null;

  readonly items = signal<NavItem[] | null>(null);
  readonly routes = computed(
    () =>
      new Set(
        (this.items() ?? [])
          .flatMap((item) => [item, ...item.children])
          .flatMap((item) => (item.route ? [item.route] : [])),
      ),
  );

  /** Carga el menú una vez por sesión (o de nuevo tras `reset`). */
  load(): Observable<NavItem[]> {
    const loaded = this.items();
    if (loaded) return of(loaded);
    this.pending ??= this.http.get<NavItem[]>(`${environment.apiBaseUrl}/navigation`).pipe(
      catchError(() => of([] as NavItem[])),
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
    return [...routes].some((route) => path === route || path.startsWith(`${route}/`));
  }
}
