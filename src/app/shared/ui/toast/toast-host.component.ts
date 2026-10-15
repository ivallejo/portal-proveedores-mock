import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { SpinnerComponent } from '../spinner/spinner.component';
import { IconName } from '../icon/icon-name';
import { ToastTone } from './toast-tone';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-host',
  imports: [IconComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast-host.component.html',
})
export class ToastHostComponent {
  readonly toast = inject(ToastService);
  readonly icons: Record<ToastTone, IconName> = {
    success: 'circle-check',
    error: 'alert-circle',
    info: 'info',
  };
  readonly iconColors: Record<ToastTone, string> = {
    success: 'text-success-on-dark',
    error: 'text-danger-line',
    info: 'text-on-brand-accent',
  };
}
