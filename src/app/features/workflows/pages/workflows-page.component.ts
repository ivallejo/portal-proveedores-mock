import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-workflows-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workflows-page.component.html',
})
export class WorkflowsPageComponent {
  @Input({ required: true }) controller!: any;
}
