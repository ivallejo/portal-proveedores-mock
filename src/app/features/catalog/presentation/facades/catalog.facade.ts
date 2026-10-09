import { Injectable, computed, inject, signal } from '@angular/core';
import { SelectOption } from '../../../../shared/ui/select/select-option';
import { SessionFacade } from '../../../auth';
import { GET_CATALOG_AREAS, GET_CATALOG_COMPANIES } from '../../di/catalog.tokens';
import { CatalogApprover } from '../../domain/models/catalog-approver';
import { CatalogArea } from '../../domain/models/catalog-area';
import { CatalogCompany } from '../../domain/models/catalog-company';
import { approversOf, areasOfCompany } from '../../domain/rules/catalog-rules';

/** Sociedades del usuario, áreas y aprobadores. Se cargan una sola vez por sesión. */
@Injectable({ providedIn: 'root' })
export class CatalogFacade {
  private readonly getCompanies = inject(GET_CATALOG_COMPANIES);
  private readonly getAreas = inject(GET_CATALOG_AREAS);
  private readonly session = inject(SessionFacade);

  readonly companies = signal<CatalogCompany[]>([]);
  readonly areas = signal<CatalogArea[]>([]);
  readonly loadError = signal(false);

  readonly companyOptions = computed<SelectOption[]>(() =>
    this.companies().map((company) => ({
      value: company.code,
      label: company.name,
      sub: company.ruc ? `RUC ${company.ruc}` : `Código ${company.code}`,
    })),
  );

  /** Usuario para el que se cargó el catálogo: las sociedades dependen de quién inició sesión. */
  private loadedFor: string | null = null;

  load(): void {
    const user = this.session.user()?.username ?? null;
    if (this.loadedFor === user) return;
    this.loadedFor = user;
    this.companies.set([]);
    this.areas.set([]);
    this.loadError.set(false);
    this.getCompanies.execute().subscribe({
      next: (companies) => this.companies.set(companies),
      error: () => this.fail(),
    });
    this.getAreas.execute().subscribe({
      next: (areas) => this.areas.set(areas),
      error: () => this.fail(),
    });
  }

  /** Vuelve a pedir el catálogo (por ejemplo, tras editar sociedades o áreas). */
  reload(): void {
    this.loadedFor = null;
    this.load();
  }

  company(code: string): CatalogCompany | undefined {
    return this.companies().find((company) => company.code === code);
  }

  areaOptionsFor(companyCode: string): SelectOption[] {
    return areasOfCompany(this.areas(), companyCode).map((area) => ({
      value: area.name,
      label: area.name,
    }));
  }

  approvers(areaName: string, companyCode = '', excludeName = ''): CatalogApprover[] {
    return approversOf(this.areas(), areaName, companyCode, excludeName);
  }

  approverOptions(areaName: string, companyCode = '', excludeName = ''): SelectOption[] {
    return this.approvers(areaName, companyCode, excludeName).map((approver) => ({
      value: approver.id,
      label: approver.name,
      sub: approver.email,
    }));
  }

  private fail(): void {
    this.loadedFor = null;
    this.loadError.set(true);
  }
}
