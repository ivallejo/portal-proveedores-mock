export type Currency = 'PEN' | 'USD';

const amountFormat = new Intl.NumberFormat('es-PE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** «S/ 1,234.50» o «US$ 1,234.50». Devuelve «—» si no hay importe. */
export function money(currency: Currency | string, amount: number | null | undefined): string {
  if (amount == null) return '—';
  return `${currency === 'USD' ? 'US$' : 'S/'} ${amountFormat.format(amount)}`;
}

export function currencyName(currency: Currency | string): string {
  return currency === 'USD' ? 'Dólares (USD)' : 'Soles (PEN)';
}

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

/** «andrea.salas@empresa.pe» → «an•••••@empresa.pe». */
export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  return `${user.slice(0, 2)}•••••@${domain}`;
}

export function onlyDigits(value: string, max = 11): string {
  return value.replace(/\D/g, '').slice(0, max);
}

export function initials(name: string): string {
  const words = name
    .replace(/[^\p{L}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase() || 'U';
}

export function fileSize(bytes: number): string {
  return bytes > 1048576
    ? `${(bytes / 1048576).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
