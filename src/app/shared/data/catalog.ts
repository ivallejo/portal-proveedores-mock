import { SelectOption } from '../ui/select/select.component';

/**
 * Catálogos de prueba (sociedades, áreas y aprobadores) tomados de la
 * Propuesta 1. Se reemplazarán por los endpoints de configuración.
 */
export interface Company {
  code: string;
  name: string;
  ruc: string;
}

export interface Approver {
  name: string;
  email: string;
}

export const COMPANIES: Company[] = [
  { code: 'CAN', name: 'Corporación Andina S.A.', ruc: '20611223344' },
  { code: 'MSU', name: 'Minera del Sur S.A.C.', ruc: '20598765432' },
  { code: 'SIP', name: 'Servicios Integrales del Perú S.A.', ruc: '20487654321' },
];

export const AREAS: Record<string, Approver[]> = {
  Finanzas: [
    { name: 'María Torres', email: 'mtorres@corporacionandina.pe' },
    { name: 'Jorge Paredes', email: 'jparedes@corporacionandina.pe' },
  ],
  Logística: [
    { name: 'Ana Ríos', email: 'arios@corporacionandina.pe' },
    { name: 'Luis Campos', email: 'lcampos@corporacionandina.pe' },
  ],
  Operaciones: [
    { name: 'Carlos Vega', email: 'cvega@corporacionandina.pe' },
    { name: 'Rosa Huamán', email: 'rhuaman@corporacionandina.pe' },
  ],
  Mantenimiento: [{ name: 'Diego Salinas', email: 'dsalinas@corporacionandina.pe' }],
  Administración: [{ name: 'Patricia León', email: 'pleon@corporacionandina.pe' }],
  Tecnología: [{ name: 'Lucía Prado', email: 'lprado@corporacionandina.pe' }],
};

export function companyByCode(code: string): Company | undefined {
  return COMPANIES.find((company) => company.code === code);
}

export function approverEmail(area: string, name: string): string {
  return AREAS[area]?.find((approver) => approver.name === name)?.email ?? '';
}

export function companyOptions(allLabel?: string, allSub?: string): SelectOption[] {
  const options = COMPANIES.map((company) => ({
    value: company.code,
    label: company.name,
    sub: `RUC ${company.ruc}`,
  }));
  return allLabel ? [{ value: '', label: allLabel, sub: allSub }, ...options] : options;
}

export function areaOptions(): SelectOption[] {
  return Object.keys(AREAS).map((area) => ({ value: area, label: area }));
}

export function approverOptions(area: string, exclude = ''): SelectOption[] {
  return (AREAS[area] ?? [])
    .filter((approver) => approver.name !== exclude)
    .map((approver) => ({ value: approver.name, label: approver.name, sub: approver.email }));
}
