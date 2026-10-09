import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { SelectOption } from '../ui/select/select-option';
import { API_BASE_URL } from '../../core/config/api-base-url.token';

export interface ApiCompany {
  code: string;
  name: string;
  ruc: string | null;
  /** Correo donde la sociedad recibe los comprobantes electrónicos. */
  billingEmail: string | null;
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
  /** Sociedad a la que pertenece el área. */
  companyCode: string;
  approvers: ApiApprover[];
}

/** Sociedades del usuario, áreas y aprobadores desde `api/catalog`. Se cargan una sola vez por sesión. */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

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
    this.http.get<ApiCompany[]>(`${this.apiBaseUrl}/catalog/companies`).subscribe({
      next: (companies) => this.companies.set(companies),
      error: () => this.fail(),
    });
    this.http.get<ApiArea[]>(`${this.apiBaseUrl}/catalog/areas`).subscribe({
      next: (areas) => this.areas.set(areas),
      error: () => this.fail(),
    });
  }

  /** Vuelve a pedir el catálogo (por ejemplo, tras editar sociedades o áreas). */
  reload(): void {
    this.loadedFor = null;
    this.load();
  }

  company(code: string): ApiCompany | undefined {
    return this.companies().find((company) => company.code === code);
  }

  /** Áreas (con aprobadores) de una sociedad; cada sociedad tiene sus propias áreas. */
  areaOptionsFor(companyCode: string): SelectOption[] {
    return this.areas()
      .filter((area) => area.companyCode === companyCode)
      .map((area) => ({ value: area.name, label: area.name }));
  }

  /**
   * Aprobadores de un área que trabajan con la sociedad `companyCode` (si se indica);
   * `excludeName` quita al aprobador actual al reasignar.
   */
  approvers(areaName: string, companyCode = '', excludeName = ''): ApiApprover[] {
    const area = this.areas().find(
      (item) => item.name === areaName && (!companyCode || item.companyCode === companyCode),
    );
    return (area?.approvers ?? []).filter(
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
