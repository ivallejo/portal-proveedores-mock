import { Tone } from './tone';

/** Moneda: PEN en azul, USD en verde. */
export function currencyTone(currency: string): Tone {
  return currency === 'USD' ? 'success' : 'primary';
}
