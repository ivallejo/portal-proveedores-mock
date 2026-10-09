import { InjectionToken, inject } from '@angular/core';
import { GetCatalogAreasPort } from '../application/ports/in/get-catalog-areas.port';
import { GetCatalogCompaniesPort } from '../application/ports/in/get-catalog-companies.port';
import { CatalogQueryPort } from '../application/ports/out/catalog-query.port';
import { GetCatalogAreasUseCase } from '../application/use-cases/get-catalog-areas.use-case';
import { GetCatalogCompaniesUseCase } from '../application/use-cases/get-catalog-companies.use-case';
import { CatalogHttpAdapter } from '../infrastructure/http/catalog-http.adapter';

// El catálogo es de toda la sesión y lo usan varias features: los tokens se proveen en la raíz con su fábrica, así
// el adaptador solo se descarga con la primera pantalla que lo usa (no en el bundle inicial).
const CATALOG_QUERY = new InjectionToken<CatalogQueryPort>('CATALOG_QUERY', {
  providedIn: 'root',
  factory: () => new CatalogHttpAdapter(),
});
export const GET_CATALOG_COMPANIES = new InjectionToken<GetCatalogCompaniesPort>(
  'GET_CATALOG_COMPANIES',
  { providedIn: 'root', factory: () => new GetCatalogCompaniesUseCase(inject(CATALOG_QUERY)) },
);
export const GET_CATALOG_AREAS = new InjectionToken<GetCatalogAreasPort>('GET_CATALOG_AREAS', {
  providedIn: 'root',
  factory: () => new GetCatalogAreasUseCase(inject(CATALOG_QUERY)),
});
