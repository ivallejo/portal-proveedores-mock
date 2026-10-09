import { HistoryEventKind } from './history-event-kind';

/** Evento del historial del documento. */
export interface HistoryEvent {
  title: string;
  who: string;
  when: string;
  kind: HistoryEventKind;
  note?: string;
}
