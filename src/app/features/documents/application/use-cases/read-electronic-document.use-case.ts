import { ElectronicDocument } from '../../domain/models/electronic-document';
import { SampleDocumentContext } from '../../domain/models/sample-document-context';
import { sampleElectronicDocument } from '../../domain/rules/sample-document';
import { ReadElectronicDocumentPort } from '../ports/in/read-electronic-document.port';
import { ElectronicDocumentReaderPort } from '../ports/out/electronic-document-reader.port';

export class ReadElectronicDocumentUseCase implements ReadElectronicDocumentPort {
  constructor(private readonly reader: ElectronicDocumentReaderPort) {}

  async execute(file: File | null, context: SampleDocumentContext): Promise<ElectronicDocument> {
    if (file) {
      try {
        const parsed = await this.reader.read(file);
        if (parsed) return parsed;
      } catch {
        // Archivo ilegible: se usan los datos de ejemplo.
      }
    }
    return sampleElectronicDocument(file?.name ?? null, context, localToday());
  }
}

function localToday(): string {
  const date = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
