import { ElectronicDocument } from '../../../domain/models/electronic-document';

/** Lee un comprobante electrónico UBL; `null` si el archivo no lo es. */
export interface ElectronicDocumentReaderPort {
  read(file: File): Promise<ElectronicDocument | null>;
}
