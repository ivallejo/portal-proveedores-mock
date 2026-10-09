/** ISO (aaaa-mm-dd) → dd/mm/aaaa. */
export function formatDate(iso: string): string {
  if (!iso) return '—';
  return iso.slice(0, 10).split('-').reverse().join('/');
}

/** Suma días a una fecha ISO y devuelve otra fecha ISO. */
export function addDays(iso: string, days: number): string {
  const date = new Date(`${iso.slice(0, 10)}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Fecha y hora actual en formato «dd/mm/aaaa · hh:mm». */
export function nowStamp(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} · ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function todayIso(): string {
  const date = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
