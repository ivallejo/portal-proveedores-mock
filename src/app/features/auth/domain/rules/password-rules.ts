import { PasswordRule } from '../models/password-rule';

const MINIMUM_LENGTH = 12;
const REQUIRED_KINDS = 3;
/** Palabras que no cuentan como nombre propio al partir la razón social o el nombre completo. */
const IGNORED_NAME_WORDS = new Set([
  'del',
  'las',
  'los',
  'sac',
  'saa',
  'srl',
  'eirl',
  'sas',
  'the',
  'and',
  'por',
  'con',
]);

/**
 * Política de contraseñas de la compañía (3.1), la misma que valida el backend. Las palabras comunes y el
 * historial de las últimas 5 solo los revisa el backend y llegan como mensaje de error al guardar.
 * `personalData`: usuario, documento y nombres; la regla «sin tu usuario» solo se muestra si hay alguno.
 */
export function passwordRules(
  value: string,
  personalData: readonly (string | null | undefined)[] = [],
): PasswordRule[] {
  const rules: PasswordRule[] = [
    { label: `Mínimo ${MINIMUM_LENGTH} caracteres`, ok: value.length >= MINIMUM_LENGTH },
    {
      label: '3 de 4: mayúsculas, minúsculas, números y símbolos',
      ok: characterKinds(value) >= REQUIRED_KINDS,
    },
  ];
  const terms = personalTerms(personalData);
  if (terms.length) {
    const normalized = normalize(value);
    rules.push({
      label: 'Sin tu usuario ni tus nombres',
      ok: !terms.some((term) => normalized.includes(term)),
    });
  }
  return rules;
}

function characterKinds(value: string): number {
  return [/\p{Lu}/u, /\p{Ll}/u, /\p{Nd}/u, /[^\p{L}\p{Nd}]/u].filter((kind) => kind.test(value))
    .length;
}

/** Cada dato completo y cada palabra de 3 letras o más, en minúsculas y sin tildes. */
function personalTerms(personalData: readonly (string | null | undefined)[]): string[] {
  const terms: string[] = [];
  for (const value of personalData) {
    if (!value?.trim()) continue;
    const normalized = normalize(value.trim());
    if (normalized.length >= 3 && !normalized.includes(' ')) terms.push(normalized);
    for (const word of normalized.split(/[^\p{L}\p{Nd}]+/u)) {
      if (word.length >= 3 && !IGNORED_NAME_WORDS.has(word)) terms.push(word);
    }
  }
  return terms;
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toLowerCase();
}
