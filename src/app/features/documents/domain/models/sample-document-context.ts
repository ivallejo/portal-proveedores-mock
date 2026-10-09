/** Datos de la sesión y la sociedad para completar un comprobante de ejemplo cuando el XML no se puede leer. */
export interface SampleDocumentContext {
  entry: 'Con OC' | 'Sin OC';
  issuerName: string;
  issuerRuc: string;
  receiverName: string;
  receiverRuc: string;
}
