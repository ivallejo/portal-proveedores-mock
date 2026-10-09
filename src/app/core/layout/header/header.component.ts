import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { SessionFacade, roleLabel } from '../../../features/auth';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { initials } from '../../../shared/utils/text-format.util';
import { LayoutStateService } from '../layout-state.service';

/** Encabezado: botón del menú, título de la pantalla, accesos y la persona con sesión. */
@Component({
  selector: 'app-header',
  imports: [RouterLink, IconComponent],
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  readonly session = inject(SessionFacade);
  readonly layout = inject(LayoutStateService);

  readonly pageTitle = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.currentTitle()),
    ),
    { initialValue: this.currentTitle() },
  );

  readonly userInitials = computed(() => initials(this.session.user()?.name ?? ''));
  readonly userCaption = computed(() => {
    const user = this.session.user();
    if (!user) return '';
    if (user.roles.includes('Proveedor') && user.providerId) return `RUC ${user.providerId}`;
    const role = roleLabel(user.role);
    return user.area ? `${role} · ${user.area}` : role;
  });

  notImplemented(feature: string): void {
    this.toast.show(`${feature} estará disponible próximamente`);
  }

  logout(): void {
    this.session.logout();
    void this.router.navigate(['/login']);
  }

  private currentTitle(): string {
    let route = this.route.snapshot;
    while (route.firstChild) route = route.firstChild;
    return (route.data['title'] as string | undefined) ?? 'Inicio';
  }
}
