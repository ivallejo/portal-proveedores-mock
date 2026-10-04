import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { IconName } from '../../../shared/ui/icon/icons';

/** Enlace «Volver al inicio de sesión». */
@Component({
  selector: 'app-auth-back-link',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      routerLink="/login"
      class="flex h-8 items-center gap-2 self-start text-sm font-medium text-primary no-underline hover:text-primary-hover"
    >
      <app-icon name="arrow-left" [size]="18" [stroke]="2" />Volver al inicio de sesión
    </a>
  `,
})
export class AuthBackLinkComponent {}

/** Ícono en recuadro + título + descripción de cada paso. */
@Component({
  selector: 'app-auth-heading',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-3.5' },
  template: `
    <span
      class="flex size-[52px] shrink-0 items-center justify-center rounded-[14px]"
      [class]="success() ? 'bg-success-soft text-[#15803D]' : 'bg-primary-soft text-primary'"
    >
      <app-icon [name]="icon()" [size]="26" />
    </span>
    <div class="flex flex-col gap-1.5">
      <h2 class="m-0 text-[26px] font-bold tracking-tight text-ink sm:text-[30px]">
        {{ heading() }}
      </h2>
      <p class="m-0 text-[15px] leading-relaxed text-body-auth"><ng-content /></p>
    </div>
  `,
})
export class AuthHeadingComponent {
  readonly icon = input.required<IconName>();
  readonly heading = input.required<string>();
  readonly success = input(false);
}

/** Pasos del registro (RUC → Datos → Confirmación). */
@Component({
  selector: 'app-auth-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol aria-label="Pasos del registro" class="m-0 flex list-none items-center gap-2.5 p-0">
      @for (step of steps(); track step.label; let last = $last) {
        <li
          class="flex items-center gap-2"
          [class.flex-1]="!last"
          [attr.aria-current]="step.current ? 'step' : null"
        >
          <span
            class="flex size-7 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[13px] font-bold"
            [class]="
              step.reached
                ? 'border-primary bg-primary text-white'
                : 'border-[#C9D6EA] bg-white text-muted-auth'
            "
            >{{ step.done ? '✓' : step.index + 1 }}</span
          >
          <span
            class="text-[13px] whitespace-nowrap"
            [class]="step.reached ? 'text-ink' : 'text-muted-auth'"
            [class.font-bold]="step.current"
            >{{ step.label }}</span
          >
          @if (!last) {
            <span
              class="h-0.5 min-w-4 grow rounded-sm"
              [class]="step.done ? 'bg-primary' : 'bg-line-auth'"
            ></span>
          }
        </li>
      }
    </ol>
  `,
})
export class AuthStepperComponent {
  readonly labels = input<string[]>([]);
  readonly current = input(0);
  readonly completed = input(false);
  readonly steps = computed(() =>
    this.labels().map((label, index) => ({
      label,
      index,
      current: index === this.current(),
      reached: index <= this.current(),
      done: index < this.current() || this.completed(),
    })),
  );
}

/** Campo de contraseña con ícono de candado y botón para mostrarla. */
@Component({
  selector: 'app-password-field',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-2' },
  template: `
    <label [for]="inputId()" class="text-sm font-bold text-ink">{{ label() }}</label>
    <div class="relative flex">
      <app-icon
        name="lock"
        [size]="20"
        class="pointer-events-none absolute top-[15px] left-4 text-body-auth"
      />
      <input
        [id]="inputId()"
        [type]="visible() ? 'text' : 'password'"
        [attr.autocomplete]="autocomplete()"
        [placeholder]="placeholder()"
        [value]="value()"
        (input)="value.set($any($event.target).value)"
        [attr.aria-invalid]="invalid()"
        class="h-[50px] grow rounded-[10px] border bg-white pr-[52px] pl-12 text-[15px] text-ink outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(22,104,227,0.14)]"
        [class.border-field-auth]="!invalid()"
        [class.border-[#E04848]]="invalid()"
      />
      <button
        type="button"
        class="absolute top-[3px] right-[3px] flex size-11 items-center justify-center rounded-lg text-body-auth hover:bg-page"
        [attr.aria-label]="
          visible() ? 'Ocultar ' + label().toLowerCase() : 'Mostrar ' + label().toLowerCase()
        "
        (click)="visible.set(!visible())"
      >
        <app-icon [name]="visible() ? 'eye-off' : 'eye'" [size]="20" />
      </button>
    </div>
  `,
})
export class PasswordFieldComponent {
  readonly inputId = input.required<string>();
  readonly label = input('Contraseña');
  readonly placeholder = input('Ingresa tu contraseña');
  readonly autocomplete = input('current-password');
  readonly invalid = input(false);
  readonly value = model('');
  readonly visible = model(false);
}
