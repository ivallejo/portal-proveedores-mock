import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { IconName } from '../../../shared/ui/icon/icon-name';

const HIGHLIGHTS: { icon: IconName; label: string }[] = [
  { icon: 'shield-check', label: 'Seguro' },
  { icon: 'bolt', label: 'Rápido' },
  { icon: 'circle-check', label: 'Confiable' },
  { icon: 'clock', label: 'Siempre disponible' },
];

/** Marco de las pantallas de acceso: panel institucional a la izquierda y formulario a la derecha. */
@Component({
  selector: 'app-auth-layout',
  imports: [IconComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative flex h-dvh overflow-hidden bg-page text-ink">
      <div
        class="absolute -top-[220px] -right-[180px] size-[560px] rounded-full bg-[#E1ECFC]"
      ></div>
      <div
        class="absolute -right-[120px] -bottom-[260px] size-[480px] rounded-full bg-[#E4EEFD]"
      ></div>

      <div class="relative flex h-full w-full overflow-hidden bg-surface-auth">
        <aside
          class="bg-brand-gradient relative hidden w-[46%] max-w-[640px] shrink-0 overflow-hidden text-white lg:block"
        >
          <img
            src="images/edificio-corporativo.jpg"
            alt="Edificio corporativo de oficinas"
            class="absolute bottom-0 left-0 h-[420px] w-full object-cover object-bottom"
          />
          <div
            class="absolute bottom-[330px] left-0 h-[90px] w-full bg-linear-to-b from-[#1459CC] to-[rgba(20,89,204,0)]"
          ></div>
          <div
            class="absolute bottom-0 left-0 h-[110px] w-full bg-linear-to-t from-[rgba(6,30,80,0.75)] to-[rgba(6,30,80,0)]"
          ></div>
          <svg
            width="520"
            height="520"
            viewBox="0 0 520 520"
            fill="none"
            class="absolute top-40 -right-[260px]"
            aria-hidden="true"
          >
            <circle cx="260" cy="260" r="258" fill="#2A78EA" fill-opacity="0.35" />
          </svg>

          <div class="relative flex flex-col gap-[30px] px-14 pt-[52px]">
            <a routerLink="/login" class="flex items-center gap-3.5 text-white no-underline">
              <svg width="46" height="46" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <path
                  d="M24 3l18 10.4v21.2L24 45 6 34.6V13.4z"
                  fill="#FFFFFF"
                  fill-opacity="0.95"
                />
                <path d="M24 13l9 5.2v10.4L24 34l-9-5.4V18.2z" fill="#1A66DB" />
                <path d="M24 13l9 5.2-9 5.2-9-5.2z" fill="#6FA5F5" />
              </svg>
              <span class="text-[22px] font-bold">Portal de Proveedores</span>
            </a>
            <div class="flex flex-col gap-4">
              <h1 class="m-0 text-[42px] leading-[1.12] font-bold tracking-tight">
                {{ heading() }}<br /><span class="text-[#A9CBFF]">{{ accent() }}</span>
              </h1>
              <p class="m-0 max-w-[460px] text-[17px] leading-relaxed text-[#E3EDFF]">
                {{ description() }}
              </p>
            </div>
            <div class="flex flex-wrap gap-[26px]">
              @for (item of highlights; track item.label) {
                <div class="flex items-center gap-[9px] text-[15px] font-medium">
                  <app-icon [name]="item.icon" [size]="22" />{{ item.label }}
                </div>
              }
            </div>
          </div>

          <div class="absolute bottom-9 left-14 flex items-center gap-2.5 text-sm font-medium">
            <app-icon name="shield-check" [size]="20" />Tu proveedor, nuestro aliado
          </div>
        </aside>

        <div class="flex grow items-center justify-center overflow-y-auto px-4 py-4 sm:px-8">
          <div
            class="flex w-full max-w-[500px] flex-col gap-5 rounded-[20px] bg-white px-6 pt-9 pb-[30px] shadow-auth-card sm:px-[52px]"
          >
            <ng-content />
            <div class="flex items-center justify-center gap-2 pt-0.5 text-[13px] text-muted-auth">
              <app-icon name="shield-check" [size]="16" />Protegemos tu información
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {
  readonly heading = input.required<string>();
  readonly accent = input.required<string>();
  readonly description = input('');
  readonly highlights = HIGHLIGHTS;
}
