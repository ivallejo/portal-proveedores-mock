import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';

/** Pantalla que se muestra mientras una funcionalidad no está habilitada (ver `core/config/feature-flags.ts`). */
@Component({
  selector: 'app-under-construction-page',
  imports: [PageHeaderComponent, IconComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './under-construction-page.component.html',
})
export class UnderConstructionPageComponent {
  private readonly data = inject(ActivatedRoute).snapshot.data;
  readonly title = (this.data['title'] as string) ?? 'En construcción';
  readonly description = (this.data['description'] as string) ?? '';
}
