import { PasswordRule } from '../models/password-rule';

/** Política de contraseñas del portal (la misma que valida el backend). */
export function passwordRules(value: string): PasswordRule[] {
  return [
    { label: 'Mínimo 8 caracteres', ok: value.length >= 8 },
    { label: 'Una letra mayúscula', ok: /[A-ZÁÉÍÓÚÑ]/.test(value) },
    { label: 'Una letra minúscula', ok: /[a-záéíóúñ]/.test(value) },
    { label: 'Un número', ok: /\d/.test(value) },
  ];
}
