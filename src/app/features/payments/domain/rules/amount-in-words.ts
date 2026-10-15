import { Currency } from '../models/currency';

const UNITS = [
  '',
  'UNO',
  'DOS',
  'TRES',
  'CUATRO',
  'CINCO',
  'SEIS',
  'SIETE',
  'OCHO',
  'NUEVE',
  'DIEZ',
  'ONCE',
  'DOCE',
  'TRECE',
  'CATORCE',
  'QUINCE',
  'DIECISÉIS',
  'DIECISIETE',
  'DIECIOCHO',
  'DIECINUEVE',
  'VEINTE',
  'VEINTIUNO',
  'VEINTIDÓS',
  'VEINTITRÉS',
  'VEINTICUATRO',
  'VEINTICINCO',
  'VEINTISÉIS',
  'VEINTISIETE',
  'VEINTIOCHO',
  'VEINTINUEVE',
];
const TENS = [
  '',
  '',
  '',
  'TREINTA',
  'CUARENTA',
  'CINCUENTA',
  'SESENTA',
  'SETENTA',
  'OCHENTA',
  'NOVENTA',
];
const HUNDREDS = [
  '',
  'CIENTO',
  'DOSCIENTOS',
  'TRESCIENTOS',
  'CUATROCIENTOS',
  'QUINIENTOS',
  'SEISCIENTOS',
  'SETECIENTOS',
  'OCHOCIENTOS',
  'NOVECIENTOS',
];

/** 0–999 en letras («UNO» al final; los múltiplos usan «UN»). */
function belowThousand(n: number): string {
  if (n === 100) return 'CIEN';
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const words = [HUNDREDS[hundreds]];
  if (rest < 30) words.push(UNITS[rest]);
  else words.push(TENS[Math.floor(rest / 10)] + (rest % 10 ? ` Y ${UNITS[rest % 10]}` : ''));
  return words.filter(Boolean).join(' ');
}

/** «UNO» → «UN» delante de MIL o MILLONES («VEINTIUNO» → «VEINTIÚN»). */
function apocope(words: string): string {
  return words.replace(/VEINTIUNO$/, 'VEINTIÚN').replace(/UNO$/, 'UN');
}

function integerInWords(n: number): string {
  if (n === 0) return 'CERO';
  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const rest = n % 1000;
  const words: string[] = [];
  if (millions)
    words.push(millions === 1 ? 'UN MILLÓN' : `${apocope(integerInWords(millions))} MILLONES`);
  if (thousands) words.push(thousands === 1 ? 'MIL' : `${apocope(belowThousand(thousands))} MIL`);
  if (rest) words.push(belowThousand(rest));
  return words.join(' ');
}

/** Importe en letras para documentos: «DIECINUEVE MIL QUINIENTOS OCHENTA Y CUATRO Y 78/100 SOLES». */
export function amountInWords(amount: number, currency: Currency): string {
  const cents = Math.round(Math.abs(amount) * 100);
  const integer = Math.floor(cents / 100);
  const decimals = String(cents % 100).padStart(2, '0');
  const name = currency === 'USD' ? 'DÓLARES AMERICANOS' : 'SOLES';
  return `${integerInWords(integer)} Y ${decimals}/100 ${name}`;
}
