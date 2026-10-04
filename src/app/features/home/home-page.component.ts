import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { MODULES } from '../../core/layout/navigation';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { TONE_CLASSES } from '../../shared/ui/tone';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-2">
        <h1 class="m-0 text-[28px] font-bold tracking-tight sm:text-[34px]">
          Hola, {{ auth.user()?.name }}
        </h1>
        <p class="m-0 text-base text-body">
          Elige un módulo para consultar tus documentos. Cada uno muestra la información vinculada a
          tu {{ isProvider() ? 'RUC' : 'usuario' }}.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        @for (module of modules(); track module.path) {
          <a
            [routerLink]="module.path"
            class="card group flex min-h-[200px] flex-col gap-3 p-6 text-ink no-underline transition-shadow hover:border-primary-line hover:shadow-option"
          >
            <span
              class="flex size-12 items-center justify-center rounded-xl"
              [class]="iconClass(module.cardTone)"
            >
              <app-icon [name]="module.cardIcon" [size]="24" />
            </span>
            <span class="text-xl font-bold">{{ module.label }}</span>
            <span class="text-[15px] leading-relaxed text-body">{{ module.description }}</span>
            <span class="mt-auto flex items-center gap-1.5 text-sm font-bold text-primary">
              Ir al módulo
              <app-icon
                name="arrow-right"
                [size]="16"
                [stroke]="2.2"
                class="transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </a>
        }
      </div>

      <div
        class="bg-brand-gradient flex flex-col items-start justify-between gap-4 rounded-2xl px-7 py-6 text-white sm:flex-row sm:items-center sm:gap-6"
      >
        <div class="flex flex-col gap-1">
          <div class="text-[17px] font-bold">¿Necesitas ayuda con un documento?</div>
          <div class="text-sm text-[#E3EDFF]">
            Escríbenos a [correo de soporte] o llama al [teléfono de soporte].
          </div>
        </div>
        <button
          type="button"
          class="btn h-11 shrink-0 bg-white px-5 text-primary hover:bg-primary-tint"
          (click)="toast.show('La guía de uso estará disponible próximamente')"
        >
          Ver guía de uso
        </button>
      </div>
    </div>
  `,
})
export class HomePageComponent {
  readonly auth = inject(AuthService);
  readonly toast = inject(ToastService);
  readonly modules = computed(() => MODULES.filter((module) => this.auth.hasAnyRole(module.roles)));
  readonly isProvider = computed(() => this.auth.user()?.roles.includes('Proveedor') ?? false);

  iconClass(tone: keyof typeof TONE_CLASSES): string {
    return TONE_CLASSES[tone].icon;
  }
}
