import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-accounting-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accounting-page.component.html',
})
export class AccountingPageComponent {
  @Input({ required: true }) controller!: any;
}
