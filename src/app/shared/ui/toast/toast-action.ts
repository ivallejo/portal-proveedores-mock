/** Acción opcional del aviso («Ver», «Reintentar»…): un botón de texto que además cierra el aviso. */
export interface ToastAction {
  label: string;
  run: () => void;
}
