import { UserDocumentType } from '../../domain/models/user-document-type';

export const DOCUMENT_TYPE_LABELS: Record<UserDocumentType, string> = {
  RUC: 'RUC',
  DNI: 'DNI',
  CE: 'Carné de extranjería',
  PASAPORTE: 'Pasaporte',
  Usuario: 'Sin documento',
};
