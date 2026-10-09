export interface InboxFilter {
  ruc: string;
  /** Un estado de la bandeja (`DocumentStatus`) o vacío para todos. */
  status: string;
}
