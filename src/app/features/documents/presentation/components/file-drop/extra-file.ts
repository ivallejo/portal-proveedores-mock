/** Anexo adicional (se consolidan en un solo PDF al registrar). */
export interface ExtraFile {
  name: string;
  /** «312 KB». */
  size: string;
  uploading: boolean;
  /** Archivo original, necesario para enviarlo al backend. */
  file?: File;
}
