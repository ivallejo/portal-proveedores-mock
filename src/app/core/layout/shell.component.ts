import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { roleLabel } from '../../shared/models/models';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { ProgressBarComponent } from '../../shared/ui/feedback/feedback.components';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { initials } from '../../shared/utils/format';
import { IconName, ICONS } from '../../shared/ui/icon/icons';
import { MenuService, NavItem } from './menu.service';
import { isRouteLive } from './navigation';
import { PageLoadingService } from './page-loading.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, ProgressBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  readonly auth = inject(AuthService);
  readonly loading = inject(PageLoadingService);

  readonly isDesktop = signal(typeof window === 'undefined' || window.innerWidth >= 1024);
  /** En escritorio el menú está visible por defecto; en móvil es un panel deslizable. */
  readonly navOpen = signal(this.isDesktop());
  private readonly menu = inject(MenuService);
  /** Menú de la sesión (Configuración › Roles y permisos define qué opciones ve cada rol). */
  readonly items = computed(() => this.menu.items() ?? []);
  /** Menús principales con submenús que están desplegados. */
  readonly openGroups = signal<ReadonlySet<string>>(new Set());
  readonly isLive = isRouteLive;

  readonly pageTitle = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.currentTitle()),
    ),
    { initialValue: this.currentTitle() },
  );

  readonly userInitials = computed(() => initials(this.auth.user()?.name ?? ''));
  readonly userCaption = computed(() => {
    const user = this.auth.user();
    if (!user) return '';
    if (user.roles.includes('Proveedor') && user.providerId) return `RUC ${user.providerId}`;
    const role = roleLabel(user.role);
    return user.area ? `${role} · ${user.area}` : role;
  });

  constructor() {
    this.menu.load().subscribe((items) => {
      // Se despliega el grupo de la pantalla actual.
      const current = items.find((item) =>
        item.children.some((child) => child.route && this.router.url.startsWith(child.route)),
      );
      if (current) this.openGroups.set(new Set([current.code]));
    });
    // En móvil el menú se cierra al navegar.
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
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

  toggleGroup(code: string): void {
    this.openGroups.update((open) => {
      const next = new Set(open);
      if (!next.delete(code)) next.add(code);
      return next;
    });
  }

  icon(item: NavItem): IconName {
    return item.icon in ICONS ? (item.icon as IconName) : 'circle';
  }

  notImplemented(feature: string): void {
    this.toast.show(`${feature} estará disponible próximamente`);
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }

  private currentTitle(): string {
    let route = this.route.snapshot;
    while (route.firstChild) route = route.firstChild;
    return (route.data['title'] as string | undefined) ?? 'Inicio';
  }
}
