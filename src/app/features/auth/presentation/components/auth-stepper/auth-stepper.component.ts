import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Pasos del registro (RUC → Datos → Confirmación). */
@Component({
  selector: 'app-auth-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth-stepper.component.html',
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
