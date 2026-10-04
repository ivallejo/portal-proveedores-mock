import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { PageHeaderComponent } from '../../shared/ui/page/page.components';

/** Opciones de Configuración que aún no tienen pantalla. */
@Component({
  selector: 'app-coming-soon-page',
  imports: [PageHeaderComponent, IconComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [heading]="title" [description]="description" />
    <section class="card flex flex-col items-center gap-4 px-6 py-16 text-center">
      <span class="flex size-20 items-center justify-center rounded-full bg-page text-primary">
        <app-icon name="settings" [size]="36" [stroke]="1.6" />
      </span>
      <div class="text-lg font-bold">Esta sección estará disponible próximamente</div>
      <p class="m-0 max-w-[460px] text-sm leading-relaxed text-muted">
        Estamos preparando la administración de este catálogo. Mientras tanto, solicita los cambios
        al equipo de soporte del portal.
      </p>
      <a routerLink="/inicio" class="btn btn-outline mt-1">Volver al inicio</a>
    </section>
  `,
})
export class ComingSoonPageComponent {
  private readonly data = inject(ActivatedRoute).snapshot.data;
  readonly title = (this.data['title'] as string) ?? 'Configuración';
  readonly description = (this.data['description'] as string) ?? '';
}
