import { Tone } from '../../../../shared/ui/tone/tone';
import { EntryType } from '../../domain/models/entry-type';

export const ENTRY_TONE: Record<EntryType, Tone> = {
  'Con OC': 'primary',
  'Sin OC': 'purple',
  'Documento especial': 'teal',
};
