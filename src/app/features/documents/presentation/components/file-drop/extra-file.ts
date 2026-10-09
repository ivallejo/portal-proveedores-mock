/** Anexo adicional (se consolidan en un solo PDF al registrar). */
export interface ExtraFile {
  name: string;
  uploading: boolean;
  /** Archivo original, necesario para enviarlo al backend. */
  file?: File;
}
