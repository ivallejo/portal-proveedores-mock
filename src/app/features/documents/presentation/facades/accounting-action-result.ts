/** Resultado que se muestra en el detalle después de rechazar u observar. */
export interface AccountingActionResult {
  kind: 'bad' | 'warn';
  title: string;
  text: string;
  reason: string;
  mail: string;
}
