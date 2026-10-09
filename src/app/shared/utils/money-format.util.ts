import { Currency } from './currency';

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
