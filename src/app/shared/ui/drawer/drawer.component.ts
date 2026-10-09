import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  OnDestroy,
  OnInit,
  inject,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon-name';

let nextId = 0;

/**
 * Panel lateral derecho de Configuración (crear / editar). Proyecta pestañas con `drawer-tabs`,
 * el cuerpo y la barra inferior con `drawer-footer`.
 */
@Component({
  selector: 'app-drawer',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'closed.emit()' },
  templateUrl: './drawer.component.html',
})
export class DrawerComponent implements OnInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  readonly titleId = `app-drawer-title-${nextId++}`;

  readonly heading = input.required<string>();
  readonly subtitle = input('');
  readonly icon = input<IconName>('edit');
  readonly closed = output<void>();

  ngOnInit(): void {
    this.document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    this.document.body.style.overflow = '';
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closed.emit();
  }
}
