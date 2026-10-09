import { CatalogArea } from '../models/catalog-area';
import { UserEmail } from '../models/user-email';

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const PERSON_NAME = /^[\p{L}' .-]+$/u;

/** RUC de 11 dígitos (proveedor) o DNI de 8 (personal interno). */
export function normalizeUserDocument(raw: string, isProvider: boolean): string {
  return raw.replace(/\D/g, '').slice(0, isProvider ? 11 : 8);
}

/** RUC de un proveedor: 11 dígitos, empieza con 10 o 20. */
export function providerRucError(ruc: string): string | undefined {
  if (!/^\d{11}$/.test(ruc)) return 'El RUC debe tener 11 dígitos.';
  if (!/^(10|20)/.test(ruc)) return 'El RUC debe empezar con 10 o 20.';
  return undefined;
}

export function internalDniError(dni: string): string | undefined {
  return /^\d{8}$/.test(dni) ? undefined : 'El DNI debe tener 8 dígitos.';
}

/** Nombres o apellidos: obligatorios y solo con letras. */
export function personNameError(value: string, missing: string): string | undefined {
  if (!value.trim()) return missing;
  return PERSON_NAME.test(value.trim()) ? undefined : 'Usa solo letras.';
}

/** El área es obligatoria (salvo para el administrador) y debe ser de una de las sociedades del usuario. */
export function userAreaError(
  areaId: string,
  role: string,
  area: CatalogArea | undefined,
  companyCodes: readonly string[],
): string | undefined {
  if (area && !companyCodes.includes(area.companyCode) && companyCodes.length)
    return `El área es de ${area.companyName}: asígnale también esa sociedad.`;
  if (!areaId && role !== 'ADMINISTRATOR') return 'Selecciona el área.';
  return undefined;
}

/** Un correo nuevo debe ser válido y no repetirse en el mismo usuario. */
export function newUserEmailError(email: string, emails: readonly UserEmail[]): string | undefined {
  if (!EMAIL.test(email)) return 'Ingresa un correo válido, por ejemplo nombre@empresa.com.';
  if (emails.some((item) => item.email === email))
    return 'Este correo ya está registrado para el usuario.';
  return undefined;
}

/** Un correo nuevo de una cuenta activada se verifica antes de poder ser principal. */
export function canBePrimaryEmail(email: UserEmail, isActivated: boolean): boolean {
  return email.isVerified || !isActivated;
}
