import { Tone } from '../tone/tone';

export interface SelectOption {
  value: string;
  label: string;
  /** Texto secundario bajo la etiqueta (por ejemplo, el RUC de una sociedad). */
  sub?: string;
  /** Muestra un punto de color antes de la etiqueta. */
  tone?: Tone;
}
