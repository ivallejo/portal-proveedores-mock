import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';
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
  /** Sociedades en las que aprueba. */
  companyCodes: string[];
}

export interface ApiArea {
  id: string;
  name: string;
  approvers: ApiApprover[];
}

/** Sociedades del usuario, áreas y aprobadores desde `api/catalog`. Se cargan una sola vez por sesión. */
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

  private readonly auth = inject(AuthService);
  /** Usuario para el que se cargó el catálogo: las sociedades dependen de quién inició sesión. */
  private loadedFor: string | null = null;

  load(): void {
    const user = this.auth.user()?.username ?? null;
    if (this.loadedFor === user) return;
    this.loadedFor = user;
    this.companies.set([]);
    this.areas.set([]);
    this.loadError.set(false);
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

  /**
   * Aprobadores de un área que trabajan con la sociedad `companyCode` (si se indica);
   * `excludeName` quita al aprobador actual al reasignar.
   */
  approvers(areaName: string, companyCode = '', excludeName = ''): ApiApprover[] {
    return (this.areas().find((area) => area.name === areaName)?.approvers ?? []).filter(
      (approver) =>
        approver.name !== excludeName &&
        (!companyCode || approver.companyCodes.includes(companyCode)),
    );
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
