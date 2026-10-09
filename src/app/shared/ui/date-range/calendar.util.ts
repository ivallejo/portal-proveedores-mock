export const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'setiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const SHORT_MONTHS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'set',
  'oct',
  'nov',
  'dic',
];

export const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export const pad = (n: number) => String(n).padStart(2, '0');

export const isoOf = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const dateOf = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (iso: string, days: number) => {
  const date = dateOf(iso);
  date.setDate(date.getDate() + days);
  return isoOf(date);
};

/** Días del rango, contando ambos extremos. */
export const daysBetween = (from: string, to: string) =>
  Math.round((dateOf(to).getTime() - dateOf(from).getTime()) / 86400000) + 1;

/** «15 sep 2026». */
export const longDate = (iso: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${pad(d)} ${SHORT_MONTHS[m - 1]} ${y}`;
};

export const daysLabel = (n: number) => `${n} ${n === 1 ? 'día' : 'días'}`;
