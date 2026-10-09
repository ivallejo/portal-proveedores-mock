/** Resultado que se muestra en el detalle después de aprobar, reasignar o rechazar. */
export interface ApprovalActionResult {
  kind: 'ok' | 'bad' | 'swap';
  title: string;
  text: string;
  mail: string;
}
