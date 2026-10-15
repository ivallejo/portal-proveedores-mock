import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { NavigationItem, SessionMenuFacade, menuIcon } from '../../../features/menus';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { IconName } from '../../../shared/ui/icon/icon-name';
import { LayoutStateService } from '../layout-state.service';

/**
 * Rail de navegación M3 para pantallas medianas (768–1279 px): íconos con etiqueta corta y tooltip.
 * Los menús con submenús abren el menú lateral completo con ese grupo desplegado.
 */
@Component({
  selector: 'app-nav-rail',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './nav-rail.component.html',
})
export class NavRailComponent {
  private readonly menu = inject(SessionMenuFacade);
  private readonly router = inject(Router);
  readonly layout = inject(LayoutStateService);

  readonly items = computed(() => this.menu.items() ?? []);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  constructor() {
    this.menu.load().subscribe();
  }

  icon(item: NavigationItem): IconName {
    return menuIcon(item.icon);
  }

  /** Un grupo está activo si la pantalla actual es uno de sus submenús. */
  isGroupActive(item: NavigationItem): boolean {
    const url = this.url();
    return item.children.some((child) => !!child.route && url.startsWith(child.route));
  }
}
