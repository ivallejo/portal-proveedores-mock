import { Injectable, Signal, computed, inject } from '@angular/core';
import { SelectOption } from '../../../../shared/ui/select/select-option';
import { SessionFacade } from '../../../auth';
import { CatalogFacade } from '../../../catalog';
import { QueryPeriod } from '../../domain/models/query-period';
import {
  defaultQueryPeriod,
  isSupplierUser,
  missingRucError,
} from '../../domain/rules/supplier-rules';

/**
 * Contexto de las consultas a SAP por proveedor (Orden de pago, Estado de factura):
 * el proveedor consulta siempre su propio RUC; Cuentas por pagar y el administrador indican el RUC.
 */
@Injectable()
export class SupplierScopeFacade {
  private readonly session = inject(SessionFacade);
  private readonly catalog = inject(CatalogFacade);

  readonly isProvider = computed(() => isSupplierUser(this.session.user()?.roles ?? []));
  readonly ownRuc = computed(() => this.session.user()?.providerId ?? '');

  constructor() {
    this.catalog.load();
  }

  companyOptions(allLabel: string, allSub: string): Signal<SelectOption[]> {
    return computed<SelectOption[]>(() => [
      { value: '', label: allLabel, sub: allSub },
      ...this.catalog.companyOptions(),
    ]);
  }

  defaultPeriod(): QueryPeriod {
    return defaultQueryPeriod();
  }

  missingRuc(ruc: string): string {
    return missingRucError(this.isProvider(), ruc);
  }
}
