/** Búsqueda sin distinguir mayúsculas ni tildes. */
export function normalize(value: string | null | undefined): string {
  return (value ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function includesTerm(term: string, ...values: (string | null | undefined)[]): boolean {
  const needle = normalize(term.trim());
  return !needle || values.some((value) => normalize(value).includes(needle));
}
