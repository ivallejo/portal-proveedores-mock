import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FEATURE_FLAGS } from '../../../../../core/config/feature-flags.token';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { TONE_CLASSES } from '../../../../../shared/ui/tone/tone-classes';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';
import { SessionFacade } from '../../../../auth';
import { MODULES, ModuleLink, SessionMenuFacade, isLinkLive } from '../../../../menus';

/** Inicio: saludo, tarjetas de los módulos del menú del usuario y ayuda. */
@Component({
  selector: 'app-home-page',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {
  readonly auth = inject(SessionFacade);
  readonly toast = inject(ToastService);
  private readonly featureFlags = inject(FEATURE_FLAGS);
  readonly isLive = (module: ModuleLink) => isLinkLive(this.featureFlags, module);
  private readonly menu = inject(SessionMenuFacade);
  /** Tarjetas de las pantallas que están en el menú del usuario. */
  readonly modules = computed(() =>
    MODULES.filter((module) => this.menu.routes().has(module.path)),
  );
  readonly isProvider = computed(() => this.auth.user()?.roles.includes('Proveedor') ?? false);

  iconClass(tone: keyof typeof TONE_CLASSES): string {
    return TONE_CLASSES[tone].icon;
  }
}
