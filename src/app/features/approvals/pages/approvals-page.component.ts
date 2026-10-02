import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApprovalsFacade } from '../state/approvals.facade';

@Component({
  selector: 'app-approvals-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './approvals-page.component.html',
  styleUrl: './approvals-page.component.scss',
})
export class ApprovalsPageComponent implements OnInit {
  readonly controller = inject(ApprovalsFacade);

  ngOnInit(): void {
    this.controller.load();
  }
}
