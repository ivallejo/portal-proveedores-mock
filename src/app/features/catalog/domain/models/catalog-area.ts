import { CatalogApprover } from './catalog-approver';

/** Área de una sociedad, con sus aprobadores. */
export interface CatalogArea {
  id: string;
  name: string;
  /** Sociedad a la que pertenece el área. */
  companyCode: string;
  approvers: CatalogApprover[];
}
