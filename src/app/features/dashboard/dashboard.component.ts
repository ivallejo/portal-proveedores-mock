import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Documento } from '../../shared/models/models';
import { Screen } from '../../core/navigation/navigation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  readonly userName = input('');
  readonly isProvider = input(false);
  readonly documents = input<Documento[]>([]);
  readonly loading = input(false);
  readonly pendingCount = input(0);
  readonly approvedCount = input(0);
  readonly rejectedCount = input(0);
  readonly navigate = output<Screen>();

  statusClass(status: string): string {
    return status
      .toLowerCase()
      .replace(/\s+/g, '-')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
