const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/** Código de sociedad SAP: de 2 a 5 letras o números, en mayúsculas. */
export function normalizeSocietyCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 5);
}

export function normalizeSocietyRuc(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 11);
}

export function societyCodeError(code: string): string | undefined {
  if (!code) return 'Ingresa el código.';
  if (!/^[A-Z0-9]{2,5}$/.test(code)) return 'De 2 a 5 letras o números.';
  return undefined;
}

export function societyNameError(name: string): string | undefined {
  return name.trim() ? undefined : 'Ingresa la razón social.';
}

/** El RUC de una empresa tiene 11 dígitos y empieza con 20. */
export function societyRucError(ruc: string): string | undefined {
  if (!/^\d{11}$/.test(ruc)) return 'El RUC debe tener 11 dígitos.';
  if (!ruc.startsWith('20')) return 'El RUC de una empresa empieza con 20.';
  return undefined;
}

export function billingEmailError(email: string): string | undefined {
  return EMAIL.test(email.trim()) ? undefined : 'Ingresa un correo válido.';
}
