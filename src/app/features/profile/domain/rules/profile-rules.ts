import { PasswordStrength } from '../models/password-strength';
import { PersonalData } from '../models/personal-data';
import { PersonalDataErrors } from '../models/personal-data-errors';
import { Profile } from '../models/profile';
import { ProfileEmail } from '../models/profile-email';

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const PERSON_NAME = /^[\p{L}' .-]+$/u;

/** «DNI 45678123», «RUC 20…» o el usuario si no es un documento. */
export function accessIdOf(profile: Profile): string {
  if (profile.isProvider && profile.ruc) return `RUC ${profile.ruc}`;
  return /^\d{8}$/.test(profile.username) ? `DNI ${profile.username}` : profile.username;
}

/** Un RUC que empieza con 10 es de una persona natural con negocio. */
export function taxpayerTypeOf(ruc: string | null): string {
  return ruc?.startsWith('10') ? 'Persona natural con negocio' : 'Persona jurídica';
}

export function primaryEmailOf(profile: Profile): string | undefined {
  return profile.emails.find((email) => email.isPrimary)?.email;
}

export function personalDataOf(profile: Profile): PersonalData {
  return {
    businessName: profile.businessName ?? '',
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
  };
}

/** El proveedor edita su razón social; el personal interno, sus nombres y apellidos. */
export function isPersonalDataDirty(profile: Profile, data: PersonalData): boolean {
  const saved = personalDataOf(profile);
  return profile.isProvider
    ? data.businessName !== saved.businessName
    : data.firstName !== saved.firstName || data.lastName !== saved.lastName;
}

export function personalDataErrors(isProvider: boolean, data: PersonalData): PersonalDataErrors {
  const errors: PersonalDataErrors = {};
  if (isProvider) {
    if (!data.businessName.trim()) errors.businessName = 'Ingresa la razón social.';
    else if (data.businessName.trim().length < 3)
      errors.businessName = 'La razón social debe tener al menos 3 caracteres.';
  } else {
    if (!data.firstName.trim()) errors.firstName = 'Ingresa tus nombres.';
    else if (!PERSON_NAME.test(data.firstName.trim())) errors.firstName = 'Usa solo letras.';
    if (!data.lastName.trim()) errors.lastName = 'Ingresa tus apellidos.';
    else if (!PERSON_NAME.test(data.lastName.trim())) errors.lastName = 'Usa solo letras.';
  }
  return errors;
}

/** Solo los campos que corresponden al tipo de usuario, sin espacios sobrantes. */
export function personalDataChanges(
  isProvider: boolean,
  data: PersonalData,
): Partial<PersonalData> {
  return isProvider
    ? { businessName: data.businessName.trim() }
    : { firstName: data.firstName.trim(), lastName: data.lastName.trim() };
}

/** Un correo nuevo debe ser válido y no repetirse en el perfil. */
export function newProfileEmailError(
  email: string,
  emails: readonly ProfileEmail[],
): string | undefined {
  if (!EMAIL.test(email)) return 'Ingresa un correo válido, por ejemplo nombre@empresa.com.';
  if (emails.some((item) => item.email === email))
    return 'Este correo ya está registrado en tu perfil.';
  return undefined;
}

/** Fuerza según los requisitos cumplidos (de 4) y un punto extra desde 12 caracteres. */
export function passwordStrength(value: string, metRules: number): PasswordStrength {
  if (!value) return 0;
  const score = metRules + (value.length >= 12 ? 1 : 0);
  return score <= 2 ? 1 : score === 3 ? 2 : score === 4 ? 3 : 4;
}
