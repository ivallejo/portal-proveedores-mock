import { IdentityDocumentType } from './identity-document-type';

/** Cómo se identifica la cuenta: RUC (proveedor), documento del personal interno o, en cuentas antiguas, solo su usuario. */
export type UserDocumentType = 'RUC' | IdentityDocumentType | 'Usuario';
