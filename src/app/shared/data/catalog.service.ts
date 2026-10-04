import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SelectOption } from '../ui/select/select.component';

export interface ApiCompany {
  code: string;
  name: string;
  ruc: string | null;
}

export interface ApiApprover {
  id: string;
  name: string;
  email: string;
}

export interface ApiArea {
  id: string;
  name: string;
  approvers: ApiApprover[];
}

/** Sociedades, áreas y aprobadores desde `api/catalog`. Se cargan una sola vez. */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);

  readonly companies = signal<ApiCompany[]>([]);
  readonly areas = signal<ApiArea[]>([]);
  readonly loadError = signal(false);

  readonly companyOptions = computed<SelectOption[]>(() =>
    this.companies().map((company) => ({
      value: company.code,
      label: company.name,
      sub: company.ruc ? `RUC ${company.ruc}` : `Código ${company.code}`,
    })),
  );
  readonly areaOptions = computed<SelectOption[]>(() =>
    this.areas().map((area) => ({ value: area.name, label: area.name })),
  );

  private loaded = false;

  load(): void {
    if (this.loaded) return;
    this.loaded = true;
    this.http.get<ApiCompany[]>(`${environment.apiBaseUrl}/catalog/companies`).subscribe({
      next: (companies) => this.companies.set(companies),
      error: () => this.fail(),
    });
    this.http.get<ApiArea[]>(`${environment.apiBaseUrl}/catalog/areas`).subscribe({
      next: (areas) => this.areas.set(areas),
      error: () => this.fail(),
    });
  }

  company(code: string): ApiCompany | undefined {
    return this.companies().find((company) => company.code === code);
  }

  /** Aprobadores de un área; `excludeName` quita al aprobador actual al reasignar. */
  approvers(areaName: string, excludeName = ''): ApiApprover[] {
    return (this.areas().find((area) => area.name === areaName)?.approvers ?? []).filter(
      (approver) => approver.name !== excludeName,
    );
  }

  approverOptions(areaName: string, excludeName = ''): SelectOption[] {
    return this.approvers(areaName, excludeName).map((approver) => ({
      value: approver.id,
      label: approver.name,
      sub: approver.email,
    }));
  }

  private fail(): void {
    this.loaded = false;
    this.loadError.set(true);
  }
}
