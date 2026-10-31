import { CatalogArea } from '../models/catalog-area';
import { IdentityDocumentType } from '../models/identity-document-type';
import { UserEmail } from '../models/user-email';

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const PERSON_NAME = /^[\p{L}' .-]+$/u;

/** RUC de 11 dígitos y DNI de 8 (solo números); carné de extranjería y pasaporte: letras y números, hasta 12. */
export function normalizeUserDocument(raw: string, type: 'RUC' | IdentityDocumentType): string {
  if (type === 'RUC' || type === 'DNI')
    return raw.replace(/\D/g, '').slice(0, type === 'RUC' ? 11 : 8);
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 12);
}

/** RUC de un proveedor: 11 dígitos, empieza con 10 o 20. */
export function providerRucError(ruc: string): string | undefined {
  if (!/^\d{11}$/.test(ruc)) return 'El RUC debe tener 11 dígitos.';
  if (!/^(10|20)/.test(ruc)) return 'El RUC debe empezar con 10 o 20.';
  return undefined;
}

/** Documento del personal interno, con las mismas reglas que el backend (IdentityDocument). */
export function identityDocumentError(
  type: IdentityDocumentType,
  number: string,
): string | undefined {
  if (type === 'DNI') return /^\d{8}$/.test(number) ? undefined : 'El DNI debe tener 8 dígitos.';
  if (/^[A-Z0-9]{1,12}$/.test(number)) return undefined;
  return type === 'CE'
    ? 'Ingresa el carné de extranjería: letras y números, hasta 12.'
    : 'Ingresa el pasaporte: letras y números, hasta 12.';
}

/** Usuario del personal interno, con las mismas reglas que el backend (UsernamePolicy). */
export function usernameError(username: string): string | undefined {
  const value = username.trim();
  if (value.length < 4 || value.length > 50)
    return 'El usuario debe tener entre 4 y 50 caracteres.';
  if (!/^[A-Za-z0-9._-]+$/.test(value))
    return 'Usa solo letras, números, punto, guion y guion bajo (sin espacios, tildes ni @).';
  if (/^\d{11}$/.test(value))
    return 'No puede ser un número de 11 dígitos: se confundiría con un RUC.';
  return undefined;
}

/** Usuario propuesto: inicial del nombre y primer apellido, en minúsculas y sin tildes (p. ej. «jperez»). */
export function suggestUsername(firstName: string, lastName: string): string {
  const clean = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .trim();
  const initial = clean(firstName).charAt(0);
  const surname = clean(lastName).split(/\s+/)[0] ?? '';
  return `${initial}${surname}`.slice(0, 50);
}

/** Nombres o apellidos: obligatorios y solo con letras. */
export function personNameError(value: string, missing: string): string | undefined {
  if (!value.trim()) return missing;
  return PERSON_NAME.test(value.trim()) ? undefined : 'Usa solo letras.';
}

/** El área es obligatoria (salvo para el administrador) y debe compartir al menos una sociedad con el usuario. */
export function userAreaError(
  areaId: string,
  role: string,
  area: CatalogArea | undefined,
  companyCodes: readonly string[],
): string | undefined {
  if (area && companyCodes.length && !area.companyCodes.some((code) => companyCodes.includes(code)))
    return `El área está en ${area.companyCodes.join(', ')}: asígnale alguna de esas sociedades.`;
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
