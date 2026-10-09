import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DrawerComponent } from '../../../../../shared/ui/drawer/drawer.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { SocietyListFacade } from '../../facades/society-list.facade';

/** Panel lateral para crear o editar una sociedad. */
@Component({
  selector: 'app-society-form-drawer',
  imports: [DrawerComponent, IconComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './society-form-drawer.component.html',
})
export class SocietyFormDrawerComponent {
  readonly facade = inject(SocietyListFacade);
  /** La sociedad en edición (nula al crear una nueva). */
  readonly society = computed(() => {
    const editing = this.facade.editing();
    return editing && editing !== 'new' ? editing : null;
  });
}
