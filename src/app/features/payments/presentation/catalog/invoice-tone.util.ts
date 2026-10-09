import { Tone } from '../../../../shared/ui/tone/tone';

/** Color de la etiqueta según el estado de SAP. */
export function invoiceTone(status: string): Tone {
  const text = status.toLowerCase();
  if (text.includes('pagad')) return 'success';
  if (text.includes('anulad') || text.includes('rechaz')) return 'danger';
  if (text.includes('observ')) return 'warn';
  if (text.includes('recepcion')) return 'info';
  return 'neutral';
}
