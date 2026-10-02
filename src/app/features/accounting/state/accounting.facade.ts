import { Injectable, computed, inject, signal } from '@angular/core';
import { ContabilizacionService } from '../services/contabilizacion.service';
import { DocumentoService } from '../../documents/services/documento.service';
import { NavigationService } from '../../../core/navigation/navigation.service';
import { Documento } from '../../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class AccountingFacade {
  readonly Math = Math;
  private readonly documentoService = inject(DocumentoService);
  readonly contabilizacionService = inject(ContabilizacionService);
  readonly screen = inject(NavigationService).screen;
  readonly loading = signal(false);
  readonly accountingItems = signal<Documento[]>(
    this.documentoService
      .documents()
      .filter((item) => item.status === 'Pendiente de contabilización'),
  );
  readonly accountingQuery = signal('');
  readonly accountingPage = signal(1);
  readonly accountingPageSize = signal(5);
  readonly accountingSociety = signal('');
  readonly accountingType = signal('');
  readonly filteredAccountingItems = computed(() => {
    const term = this.accountingQuery().trim().toLowerCase();
    return this.accountingItems().filter((item) =>
      `${item.numero} ${item.proveedor} ${item.sociedad} ${item.contabilizacion?.numero || ''}`
        .toLowerCase()
        .includes(term),
    );
  });
  readonly accountingPageCount = computed(() =>
    Math.max(1, Math.ceil(this.filteredAccountingItems().length / this.accountingPageSize())),
  );
  readonly accountingItemsPage = computed(() => {
    const start = (this.accountingPage() - 1) * this.accountingPageSize();
    return this.filteredAccountingItems().slice(start, start + this.accountingPageSize());
  });
  readonly accountingPaginationPages = computed(() =>
    Array.from({ length: this.accountingPageCount() }, (_, index) => index + 1),
  );

  load(): void {
    this.loading.set(true);
    this.contabilizacionService.ejecutarJobDiario().subscribe(() =>
      this.contabilizacionService
        .contabilizados(this.accountingSociety(), this.accountingType())
        .subscribe((items) => {
          this.accountingItems.set(items);
          this.accountingPage.set(1);
          this.loading.set(false);
        }),
    );
  }
  setAccountingQuery(value: string): void {
    this.accountingQuery.set(value);
    this.accountingPage.set(1);
  }
  setAccountingPageSize(value: string): void {
    this.accountingPageSize.set(Number(value));
    this.accountingPage.set(1);
  }
  setAccountingPage(page: number): void {
    this.accountingPage.set(page);
  }
  resendAttachments(id: number): void {
    this.contabilizacionService.reenviarAnexos(id).subscribe();
  }
  statusClass(status: string): string {
    return status.toLowerCase().replaceAll(' ', '-');
  }
}
