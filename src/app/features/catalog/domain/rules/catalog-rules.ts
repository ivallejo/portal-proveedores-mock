import { CatalogApprover } from '../models/catalog-approver';
import { CatalogArea } from '../models/catalog-area';

/** Áreas de una sociedad; cada sociedad tiene sus propias áreas. */
export function areasOfCompany(areas: readonly CatalogArea[], companyCode: string): CatalogArea[] {
  return areas.filter((area) => area.companyCode === companyCode);
}

/**
 * Aprobadores de un área que trabajan con la sociedad `companyCode` (si se indica);
 * `excludeName` quita al aprobador actual al reasignar.
 */
export function approversOf(
  areas: readonly CatalogArea[],
  areaName: string,
  companyCode = '',
  excludeName = '',
): CatalogApprover[] {
  const area = areas.find(
    (item) => item.name === areaName && (!companyCode || item.companyCode === companyCode),
  );
  return (area?.approvers ?? []).filter(
    (approver) =>
      approver.name !== excludeName &&
      (!companyCode || approver.companyCodes.includes(companyCode)),
  );
}
