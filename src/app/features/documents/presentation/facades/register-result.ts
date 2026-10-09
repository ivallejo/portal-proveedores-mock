/** Resultado final del registro (éxito o rechazo de SAP/SUNAT). */
export interface RegisterResult {
  ok: boolean;
  title: string;
  text: string;
  chips: { label: string; value: string; tone?: 'info' | 'warn' | 'danger' }[];
  mail: string;
}
