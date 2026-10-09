import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DrawerComponent } from '../../../../../shared/ui/drawer/drawer.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { SelectComponent } from '../../../../../shared/ui/select/select.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { AreaListFacade } from '../../facades/area-list.facade';

/** Panel lateral para crear o editar un área. */
@Component({
  selector: 'app-area-form-drawer',
  imports: [DrawerComponent, IconComponent, SelectComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './area-form-drawer.component.html',
})
export class AreaFormDrawerComponent {
  readonly facade = inject(AreaListFacade);
  /** El área en edición (nula al crear una nueva). */
  readonly area = computed(() => {
    const editing = this.facade.editing();
    return editing && editing !== 'new' ? editing : null;
  });
}
