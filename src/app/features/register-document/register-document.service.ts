import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { DocumentItem } from '../../shared/documents/document.model';
import { todayIso } from '../../shared/utils/format';
import { ElectronicDocument, parseUblDocument, seriesFromFileName } from './xml-reader';
import { API_BASE_URL } from '../../core/config/api-base-url.token';

export type OrderType = 'Bien' | 'Servicio';

export interface OrderInfo {
  number: string;
  type: OrderType;
  description: string;
  balance: number;
}

/** Integraciones del registro de documentos. */
@Injectable({ providedIn: 'root' })
export class RegisterDocumentService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  /**
   * Servicio 01 SAP (vía backend): valida que la orden exista, esté aprobada y tenga saldo.
   * Devuelve `null` si SAP no la reconoce; otros errores se propagan.
   */
  validateOrder(
    companyCode: string,
    type: OrderType,
    number: string,
  ): Observable<OrderInfo | null> {
    return this.http
      .post<{
        number: string;
        orderType: 'Goods' | 'Service';
        description: string;
        balance: number;
      }>(`${this.apiBaseUrl}/documents/orders/validate`, {
        companyCode,
        orderType: type === 'Bien' ? 'Goods' : 'Service',
        number: number.trim().toUpperCase(),
      })
      .pipe(
        map((order) => ({
          number: order.number,
          type: order.orderType === 'Goods' ? ('Bien' as const) : ('Servicio' as const),
          description: order.description,
          balance: order.balance,
        })),
        catchError((error: HttpErrorResponse) =>
          error.status === 422 ? of(null) : throwError(() => error),
        ),
      );
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
