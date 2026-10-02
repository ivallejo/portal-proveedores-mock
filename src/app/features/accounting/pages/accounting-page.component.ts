import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountingFacade } from '../state/accounting.facade';

@Component({
  selector: 'app-accounting-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accounting-page.component.html',
  styleUrl: './accounting-page.component.scss',
})
export class AccountingPageComponent implements OnInit {
  readonly controller = inject(AccountingFacade);

  ngOnInit(): void {
    this.controller.load();
  }
}
