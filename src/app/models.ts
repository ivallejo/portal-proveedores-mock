export type Role = 'Proveedor' | 'Área Usuaria' | 'CxP' | 'Administrador';
export type DocumentType = 'Con Orden de Compra' | 'Sin Orden de Compra' | 'Documento especial';
export type DocumentStatus =
  | 'Registrado'
  | 'En validación'
  | 'Pendiente de aprobación'
  | 'Aprobado'
  | 'Rechazado'
  | 'Devuelto al proveedor'
  | 'Pendiente de contabilización'
  | 'Contabilizado';
export type SpecialSubtype =
  'Boleto aéreo' | 'Recibo público' | 'No domiciliado' | 'Liquidación de cobranza';

export interface User {
  username: string;
  name: string;
  role: Role;
  providerId?: string;
}
export interface HistoryEntry {
  status: DocumentStatus;
  date: string;
  user: string;
  comment?: string;
}
export interface ValidationResult {
  sunat: 'Pendiente' | 'Aprobado' | 'Observado' | 'No aplica';
  sertica: 'Pendiente' | 'Aprobado' | 'Observado' | 'No aplica';
  message?: string;
}
export interface Documento {
  id: number;
  numero: string;
  proveedor: string;
  providerId: string;
  sociedad: string;
  tipo: DocumentType;
  subtipo?: SpecialSubtype;
  oc?: string;
  importe: number;
  fecha: string;
  aprobador: string;
  status: DocumentStatus;
  registeredAt: number;
  validation: ValidationResult;
  history: HistoryEntry[];
  comment?: string;
  escalated?: boolean;
  contabilizacion?: { ruta: 'SAP' | 'Sertica'; numero?: string; error?: string };
  details: Record<string, string>;
}
export interface RegistroDocumentoDto {
  numero: string;
  proveedor: string;
  providerId: string;
  sociedad: string;
  tipo: DocumentType;
  subtipo?: SpecialSubtype;
  oc?: string;
  importe: number;
  fecha: string;
  aprobador: string;
  validateSunat: boolean;
  details: Record<string, string>;
}
