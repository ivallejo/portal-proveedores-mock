import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { SelectOption } from '../ui/select/select-option';
import { CatalogService } from './catalog.service';

/**
 * Contexto de las consultas a SAP por proveedor (Orden de pago, Estado de factura):
 * el proveedor consulta siempre su propio RUC; Cuentas por pagar y el administrador indican el RUC.
 */
@Injectable({ providedIn: 'root' })
export class SupplierScope {
  private readonly auth = inject(AuthService);
  private readonly catalog = inject(CatalogService);

  readonly isProvider = computed(() => {
    const roles = this.auth.user()?.roles ?? [];
    return roles.includes('Proveedor') && !roles.includes('Administrador');
  });
  readonly ownRuc = computed(() => this.auth.user()?.providerId ?? '');

  constructor() {
    this.catalog.load();
  }

  companyOptions(allLabel: string, allSub: string) {
    return computed<SelectOption[]>(() => [
      { value: '', label: allLabel, sub: allSub },
      ...this.catalog.companyOptions(),
    ]);
  }

  /** Últimos tres meses hasta hoy (fechas locales en formato aaaa-mm-dd). */
  defaultRange(): { from: string; to: string } {
    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
    return { from: isoDate(from), to: isoDate(today) };
  }

  /** Mensaje si falta el RUC (solo cuando no es proveedor); vacío si se puede consultar. */
  missingRuc(ruc: string): string {
    return this.isProvider() || /^\d{11}$/.test(ruc)
      ? ''
      : 'Ingresa el RUC del proveedor (11 dígitos).';
  }
}

function isoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
