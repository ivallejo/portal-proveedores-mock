import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProgressBarComponent } from '../../../shared/ui/progress-bar/progress-bar.component';
import { HeaderComponent } from '../header/header.component';
import { LayoutStateService } from '../layout-state.service';
import { PageLoadingService } from '../page-loading.service';
import { SidebarComponent } from '../sidebar/sidebar.component';

/** Marco del portal con sesión: menú lateral, encabezado, barra de carga y la pantalla actual. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, ProgressBarComponent, HeaderComponent, SidebarComponent],
  providers: [LayoutStateService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-shell.component.html',
})
export class AppShellComponent {
  readonly layout = inject(LayoutStateService);
  readonly loading = inject(PageLoadingService);
}
