// API pública de la feature catalog: lo único que otras features pueden importar.
export type { CatalogApprover } from './domain/models/catalog-approver';
export type { CatalogArea } from './domain/models/catalog-area';
export type { CatalogCompany } from './domain/models/catalog-company';
export { CatalogFacade } from './presentation/facades/catalog.facade';
