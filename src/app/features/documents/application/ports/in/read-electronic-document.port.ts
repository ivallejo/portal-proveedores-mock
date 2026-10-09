import { ElectronicDocument } from '../../../domain/models/electronic-document';
import { SampleDocumentContext } from '../../../domain/models/sample-document-context';

export interface ReadElectronicDocumentPort {
  /** Lee el XML; si no es un UBL válido devuelve un comprobante de ejemplo. */
  execute(file: File | null, context: SampleDocumentContext): Promise<ElectronicDocument>;
}
