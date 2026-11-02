import { CatalogApprover } from './catalog-approver';

/** Área con sus aprobadores; puede estar en varias sociedades. */
export interface CatalogArea {
  id: string;
  name: string;
  /** Sociedades en las que existe el área. */
  companyCodes: string[];
  approvers: CatalogApprover[];
}
