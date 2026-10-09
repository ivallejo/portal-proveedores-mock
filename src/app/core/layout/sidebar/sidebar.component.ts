import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NavigationItem, SessionMenuFacade, isRouteLive, menuIcon } from '../../../features/menus';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { IconName } from '../../../shared/ui/icon/icon-name';
import { FEATURE_FLAGS } from '../../config/feature-flags.token';
import { LayoutStateService } from '../layout-state.service';

/** Menú lateral con las opciones del rol (Configuración › Roles y permisos define cuáles ve cada uno). */
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private readonly menu = inject(SessionMenuFacade);
  private readonly featureFlags = inject(FEATURE_FLAGS);
  readonly layout = inject(LayoutStateService);

  readonly items = computed(() => this.menu.items() ?? []);
  /** Menús principales con submenús que están desplegados. */
  readonly openGroups = signal<ReadonlySet<string>>(new Set());
  readonly isLive = (route: string | null) => isRouteLive(this.featureFlags, route);

  constructor() {
    const router = inject(Router);
    this.menu.load().subscribe((items) => {
      // Se despliega el grupo de la pantalla actual.
      const current = items.find((item) =>
        item.children.some((child) => child.route && router.url.startsWith(child.route)),
      );
      if (current) this.openGroups.set(new Set([current.code]));
    });
  }

  toggleGroup(code: string): void {
    this.openGroups.update((open) => {
      const next = new Set(open);
      if (!next.delete(code)) next.add(code);
      return next;
    });
  }

  icon(item: NavigationItem): IconName {
    return menuIcon(item.icon);
  }
}
