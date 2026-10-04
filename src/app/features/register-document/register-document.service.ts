import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { DocumentItem } from '../../shared/documents/document.model';
import { todayIso } from '../../shared/utils/format';
import { ElectronicDocument, parseUblDocument, seriesFromFileName } from './xml-reader';

export type OrderType = 'Bien' | 'Servicio';

export interface OrderInfo {
  number: string;
  type: OrderType;
  description: string;
  balance: number;
}

/** Órdenes de prueba que responde el Servicio 01 de SAP. */
const ORDERS: Record<OrderType, Record<string, Omit<OrderInfo, 'number' | 'type'>>> = {
  Servicio: {
    '4500012873': {
      description: 'Mantenimiento correctivo de compresores – Planta Lurín',
      balance: 18450,
    },
    '4500012851': {
      description: 'Servicio de calibración de equipos de medición',
      balance: 7230.5,
    },
  },
  Bien: {
    'CR-2026-00418': {
      description: 'Repuestos para fajas transportadoras · 3 entregas recibidas',
      balance: 18450,
    },
  },
};

/** Integraciones del registro de documentos (simuladas hasta tener el backend). */
@Injectable({ providedIn: 'root' })
export class RegisterDocumentService {
  /** Servicio 01 SAP: valida que la orden exista, esté aprobada y tenga saldo. */
  validateOrder(
    companyCode: string,
    type: OrderType,
    number: string,
  ): Observable<OrderInfo | null> {
    const key = number.trim().toUpperCase();
    const found = companyCode ? ORDERS[type][key] : undefined;
    return of(found ? { number: key, type, ...found } : null).pipe(delay(1400));
  }

  /**
   * Lee el XML del comprobante. Si el archivo no es un UBL válido se usan datos de
   * ejemplo para que el flujo pueda probarse con cualquier archivo.
   */
  async readXml(
    file: File | null,
    fallback: {
      entry: 'Con OC' | 'Sin OC';
      issuerName: string;
      issuerRuc: string;
      receiverName: string;
      receiverRuc: string;
    },
  ): Promise<ElectronicDocument> {
    if (file) {
      try {
        const parsed = parseUblDocument(await file.text());
        if (parsed) return parsed;
      } catch {
        // Archivo ilegible: se usan los datos de ejemplo.
      }
    }
    const series = (file && seriesFromFileName(file.name)) || 'F001';
    const isFee = series.startsWith('E');
    const items: DocumentItem[] =
      fallback.entry === 'Con OC'
        ? isFee
          ? [
              {
                description: 'Servicio de asesoría técnica en mantenimiento',
                quantity: 1,
                unitPrice: 3500,
              },
            ]
          : [
              {
                description: 'Mantenimiento correctivo de compresores – Planta Lurín',
                quantity: 1,
                unitPrice: 12500,
              },
              {
                description: 'Repuestos: kit de válvulas y empaquetaduras',
                quantity: 2,
                unitPrice: 1567.7966,
              },
            ]
        : isFee
          ? [
              {
                description: 'Asesoría tributaria – cierre tercer trimestre 2026',
                quantity: 1,
                unitPrice: 3500,
              },
            ]
          : [
              {
                description: 'Reparación de tableros eléctricos – nave 2',
                quantity: 1,
                unitPrice: 6000,
              },
            ];
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const igv = isFee ? null : +(subtotal * 0.18).toFixed(2);
    const fileNumber = file?.name.match(/([A-Z0-9]{4}-\d{1,8})/i)?.[1]?.toUpperCase();
    const number =
      fileNumber ??
      `${series}-${String(Math.floor(Date.now() / 1000) % 100000000).padStart(8, '0')}`;
    return {
      number,
      series,
      documentType: isFee ? 'Recibo por honorarios electrónico' : 'Factura electrónica',
      issuerName: fallback.issuerName,
      issuerRuc: fallback.issuerRuc,
      receiverName: fallback.receiverName,
      receiverRuc: fallback.receiverRuc,
      issuedAt: todayIso(),
      currency: 'PEN',
      paymentTerms: 'Crédito a 30 días',
      items,
      subtotal,
      igv,
      total: +(subtotal + (igv ?? 0)).toFixed(2),
      fromXml: false,
    };
  }
}
