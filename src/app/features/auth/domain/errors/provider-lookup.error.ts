import { ProviderLookupFailure } from '../models/provider-lookup-failure';

/** La consulta del RUC para el registro no se puede completar; `message` es el detalle del backend, si lo hay. */
export class ProviderLookupError extends Error {
  override readonly name = 'ProviderLookupError';

  constructor(
    readonly failure: ProviderLookupFailure,
    message = '',
  ) {
    super(message);
  }
}
