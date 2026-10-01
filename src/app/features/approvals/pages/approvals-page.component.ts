import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-approvals-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './approvals-page.component.html',
})
export class ApprovalsPageComponent {
  @Input({ required: true }) controller!: any;
}
