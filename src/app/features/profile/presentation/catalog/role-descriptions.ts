import { Role } from '../../../auth';

/** Qué puede hacer cada rol, para el resumen de la cuenta. */
export const ROLE_DESCRIPTIONS: Partial<Record<Role, string>> = {
  Proveedor: 'Consulta órdenes, pagos y facturas; registra documentos.',
  'Colaborador interno': 'Registra documentos sin orden de compra y documentos especiales.',
  'Área Usuaria': 'Revisa y aprueba documentos sin orden de compra.',
  CxP: 'Contabiliza, observa o rechaza documentos aprobados.',
  Administrador: 'Acceso total, incluida la configuración del portal.',
};
