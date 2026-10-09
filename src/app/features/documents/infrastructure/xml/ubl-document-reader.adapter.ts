import { Injectable } from '@angular/core';
import { ElectronicDocumentReaderPort } from '../../application/ports/out/electronic-document-reader.port';
import { ElectronicDocument } from '../../domain/models/electronic-document';
import { parseUblDocument } from './ubl-document-parser';

/** Lee el XML del comprobante en el navegador (UBL 2.1). */
@Injectable()
export class UblDocumentReaderAdapter implements ElectronicDocumentReaderPort {
  async read(file: File): Promise<ElectronicDocument | null> {
    return parseUblDocument(await file.text());
  }
}
