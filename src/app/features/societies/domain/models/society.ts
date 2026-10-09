/** Sociedad del grupo: código SAP, razón social, RUC y correo de facturación, con sus totales de áreas y usuarios. */
export interface Society {
  id: string;
  code: string;
  name: string;
  ruc: string | null;
  /** Recibe los comprobantes electrónicos y copia de las notificaciones a proveedores. */
  billingEmail: string | null;
  isActive: boolean;
  areaCount: number;
  userCount: number;
}
