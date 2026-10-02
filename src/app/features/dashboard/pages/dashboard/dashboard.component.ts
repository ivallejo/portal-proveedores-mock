import { Component, input, output } from '@angular/core';
import { Screen } from '../../../../core/navigation/navigation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  readonly userName = input('');
  readonly navigate = output<Screen>();
}
