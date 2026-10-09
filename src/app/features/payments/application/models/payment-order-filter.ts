export interface PaymentOrderFilter {
  /** Solo para Cuentas por pagar y el administrador; el proveedor consulta siempre su RUC. */
  ruc: string;
  company: string;
  from: string;
  to: string;
}
