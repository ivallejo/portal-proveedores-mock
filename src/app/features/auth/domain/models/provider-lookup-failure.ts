/**
 * Por qué no se puede registrar un RUC: ya tiene cuenta, es proveedor pero no tiene correo en SAP, falta otro dato
 * en SAP, el servicio de consulta no responde o el RUC no está en el registro de proveedores.
 */
export type ProviderLookupFailure =
  'already-registered' | 'missing-email' | 'cannot-register' | 'unavailable' | 'not-found';
