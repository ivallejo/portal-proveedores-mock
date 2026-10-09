/** El documento no superó la validación de SAP, SUNAT o duplicidad; `message` es el detalle del backend. */
export class DocumentRejectedError extends Error {
  override readonly name = 'DocumentRejectedError';
}
