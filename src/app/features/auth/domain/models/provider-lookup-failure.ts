/**
 * Por qué no se puede registrar un RUC: ya tiene cuenta, falta un dato en SAP (por ejemplo, el correo),
 * el servicio de consulta no responde o el RUC no está en el registro de proveedores.
 */
export type ProviderLookupFailure =
  'already-registered' | 'cannot-register' | 'unavailable' | 'not-found';
