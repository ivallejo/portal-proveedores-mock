import { Injectable, signal } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { approverEmail } from '../data/catalog';
import { formatDate, nowStamp } from '../utils/format';
import { Actor, DocumentStatus, HistoryEvent, PortalDocument, actorLabel } from './document.model';
import { seedDocuments } from './document.seed';

const STORAGE_KEY = 'portal-proveedores.documents.v2';

export interface DocumentFilters {
  ruc: string;
  status: string;
}

export const APPROVAL_STATUSES: DocumentStatus[] = [
  'Pendiente de aprobación',
  'Aprobado',
  'Pendiente de contabilización',
  'Rechazado',
];

export const ACCOUNTING_STATUSES: DocumentStatus[] = [
  'Pendiente de contabilización',
  'Contabilizado',
  'Observado',
  'Rechazado',
];

/**
 * Documentos registrados en el portal (versión de prueba en el navegador).
 * Expone la misma forma que tendrá la API: consultas y acciones asíncronas
 * que devuelven el documento actualizado.
 */
@Injectable({ providedIn: 'root' })
export class DocumentsService {
  private readonly documents = signal<PortalDocument[]>(this.load());

  /** Documentos que pasaron por aprobación (Sin OC y especiales asignados a un aprobador). */
  approvals(filters: DocumentFilters): Observable<PortalDocument[]> {
    const list = this.documents().filter(
      (doc) =>
        !!doc.approver &&
        APPROVAL_STATUSES.includes(doc.status) &&
        !(doc.status === 'Rechazado' && doc.rejectedBy === 'contabilidad'),
    );
    return of(this.applyFilters(list, filters)).pipe(delay(900));
  }

  /** Documentos que llegaron a Cuentas por pagar. */
  accounting(filters: DocumentFilters): Observable<PortalDocument[]> {
    const list = this.documents().filter(
      (doc) =>
        ACCOUNTING_STATUSES.includes(doc.status) &&
        !(doc.status === 'Rechazado' && doc.rejectedBy !== 'contabilidad'),
    );
    return of(this.applyFilters(list, filters)).pipe(delay(900));
  }

  get(number: string): Observable<PortalDocument> {
    const doc = this.find(number);
    return doc ? of(doc).pipe(delay(750)) : throwError(() => new Error('Documento no encontrado.'));
  }

  /** ¿Ya existe un documento con ese número para el mismo RUC? (validación de duplicidad). */
  isDuplicate(number: string, ruc: string): boolean {
    return this.documents().some(
      (doc) => doc.number.toUpperCase() === number.toUpperCase() && doc.providerRuc === ruc,
    );
  }

  register(doc: PortalDocument): Observable<PortalDocument> {
    if (this.isDuplicate(doc.number, doc.providerRuc)) {
      return throwError(() => new Error('Documento duplicado')).pipe(delay(1500));
    }
    this.save([doc, ...this.documents()]);
    return of(doc).pipe(delay(1500));
  }

  approve(
    number: string,
    referenceLabel: string,
    reference: string,
    actor: Actor,
  ): Observable<PortalDocument> {
    const now = nowStamp();
    return this.update(number, (doc) => ({
      ...doc,
      status: 'Pendiente de contabilización',
      approvedAt: now,
      history: [
        ...this.closeCurrent(doc.history),
        {
          title: 'Documento aprobado',
          who: `Por ${actorLabel(actor)} · ${referenceLabel} ${reference}`,
          when: now,
          kind: 'done',
        },
        {
          title: 'Enviado a contabilización',
          who: 'Pendiente de contabilización · Contabilidad',
          when: now,
          kind: 'current',
        },
      ],
    }));
  }

  reassign(
    number: string,
    area: string,
    approver: string,
    reason: string,
    actor: Actor,
  ): Observable<PortalDocument> {
    const now = nowStamp();
    return this.update(number, (doc) => ({
      ...doc,
      area,
      approver,
      approverEmail: approverEmail(area, approver),
      history: [
        ...this.closeCurrent(doc.history),
        {
          title: `Reasignado a ${approver}`,
          who: `Por ${actorLabel(actor)}`,
          when: now,
          kind: 'done',
          note: reason,
        },
        {
          title: 'Pendiente de aprobación',
          who: `En revisión de ${approver} · ${area}`,
          when: `Desde ${now}`,
          kind: 'current',
        },
      ],
    }));
  }

  reject(
    number: string,
    reason: string,
    actor: Actor,
    stage: 'aprobador' | 'contabilidad',
  ): Observable<PortalDocument> {
    const now = nowStamp();
    return this.update(number, (doc) => ({
      ...doc,
      status: 'Rechazado',
      rejectedBy: stage,
      history: [
        ...this.closeCurrent(doc.history),
        {
          title: 'Documento rechazado',
          who: `Por ${actorLabel(actor)}`,
          when: now,
          kind: 'bad',
          note: reason,
        },
        {
          title: 'Proveedor notificado por correo',
          who: doc.providerEmail ? `A ${doc.providerEmail}` : 'Sistema',
          when: now,
          kind: 'done',
        },
      ],
    }));
  }

  observe(number: string, reason: string, email: string, actor: Actor): Observable<PortalDocument> {
    const now = nowStamp();
    return this.update(number, (doc) => ({
      ...doc,
      status: 'Observado',
      history: [
        ...this.closeCurrent(doc.history),
        {
          title: 'Documento observado',
          who: `Por ${actorLabel(actor)}`,
          when: now,
          kind: 'warn',
          note: reason,
        },
        { title: 'Observación enviada por correo', who: `A ${email}`, when: now, kind: 'done' },
      ],
    }));
  }

  /** Eventos iniciales de un documento recién registrado. */
  registrationHistory(doc: PortalDocument, validation: string): HistoryEvent[] {
    const now = nowStamp();
    const events: HistoryEvent[] = [];
    if (doc.orderNumber) {
      events.push({
        title: 'Orden validada en SAP',
        who: `Servicio 01 SAP · ${doc.orderNumber}`,
        when: now,
        kind: 'done',
      });
    }
    events.push(
      {
        title: 'Documento registrado',
        who: `${doc.registeredBy} · ${doc.entryType === 'Con OC' ? 'Con orden de compra' : doc.entryType === 'Sin OC' ? 'Sin orden de compra' : 'Documento especial'}`,
        when: now,
        kind: 'done',
      },
      { title: validation, who: 'Servicio 02 SAP', when: now, kind: 'done' },
    );
    if (doc.status === 'Pendiente de aprobación') {
      events.push(
        {
          title: 'Asignado para aprobación',
          who: `${doc.approver} · ${doc.area}`,
          when: now,
          kind: 'done',
        },
        {
          title: 'Pendiente de aprobación',
          who: `En revisión de ${doc.approver}`,
          when: `Desde ${formatDate(doc.registeredAt)}`,
          kind: 'current',
        },
      );
    } else {
      events.push({
        title: 'Pendiente de contabilización',
        who: 'Cuentas por pagar · Contabilidad',
        when: `Desde ${formatDate(doc.registeredAt)}`,
        kind: 'current',
      });
    }
    return events;
  }

  private update(
    number: string,
    change: (doc: PortalDocument) => PortalDocument,
  ): Observable<PortalDocument> {
    const doc = this.find(number);
    if (!doc) return throwError(() => new Error('Documento no encontrado.'));
    const updated = change(doc);
    this.save(this.documents().map((item) => (item.number === number ? updated : item)));
    return of(updated).pipe(delay(1000));
  }

  private closeCurrent(history: HistoryEvent[]): HistoryEvent[] {
    return history.map((event) => (event.kind === 'current' ? { ...event, kind: 'done' } : event));
  }

  private applyFilters(list: PortalDocument[], filters: DocumentFilters): PortalDocument[] {
    return list
      .filter(
        (doc) =>
          (!filters.ruc || doc.providerRuc.includes(filters.ruc)) &&
          (!filters.status || doc.status === filters.status),
      )
      .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
  }

  private find(number: string): PortalDocument | undefined {
    return this.documents().find((doc) => doc.number === number);
  }

  private save(documents: PortalDocument[]): void {
    this.documents.set(documents);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    } catch {
      // Sin almacenamiento disponible: los cambios quedan solo en memoria.
    }
  }

  private load(): PortalDocument[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PortalDocument[];
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch {
      // Datos corruptos: se vuelve a la semilla.
    }
    return seedDocuments();
  }
}
