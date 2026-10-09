/** Proveedor encontrado en SAP por su RUC, antes de crear su cuenta. */
export interface ProviderCandidate {
  ruc: string;
  companyName: string;
  /** Correo ofuscado al que se enviará el enlace de activación. */
  email: string;
}
