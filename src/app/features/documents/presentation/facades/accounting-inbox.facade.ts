import { Injectable, computed, inject, signal } from '@angular/core';
import { OBSERVE_DOCUMENT, REJECT_DOCUMENT } from '../../di/documents.tokens';
import { PortalDocument } from '../../domain/models/portal-document';
import {
  ACCOUNTING_STATUSES,
  countWithStatus,
  isValidObservationEmail,
} from '../../domain/rules/document-rules';
import { statusOptions } from '../catalog/status-options.util';
import { AccountingActionResult } from './accounting-action-result';
import { AccountingPanel } from './accounting-panel';
import { DocumentInboxFacade } from './document-inbox.facade';

/** Contabilización: la bandeja de Cuentas por pagar con rechazar y observar. */
@Injectable()
export class AccountingInboxFacade extends DocumentInboxFacade<AccountingActionResult> {
  private readonly rejectDocument = inject(REJECT_DOCUMENT);
  private readonly observeDocument = inject(OBSERVE_DOCUMENT);

  protected readonly inbox = 'Accounting';
  readonly statusOptions = statusOptions(ACCOUNTING_STATUSES);

  readonly panel = signal<AccountingPanel>(null);
  readonly reason = signal('');
  readonly email = signal('');
  readonly panelError = signal('');
  readonly reasonInvalid = signal(false);
  readonly emailInvalid = signal(false);

  readonly kpis = computed(() => {
    const count = (status: Parameters<typeof countWithStatus>[1]) =>
      String(countWithStatus(this.rows(), status));
    return {
      pending: count('Pendiente de contabilización'),
      booked: count('Contabilizado'),
      observed: count('Observado'),
      rejected: count('Rechazado'),
    };
  });
  readonly isPending = computed(() => this.detail()?.status === 'Pendiente de contabilización');
  readonly footNote = computed(() => {
    if (this.result()) return 'El listado ya refleja el nuevo estado del documento.';
    if (!this.isPending()) return 'Documento sin acciones pendientes.';
    return this.panel()
      ? 'Completa la acción o cancélala para volver.'
      : 'Si el documento está conforme, SAP lo contabilizará en el proceso diario.';
  });

  start(): void {
    this.search();
  }

  override rowCaption(doc: PortalDocument): string {
    if (doc.entryType === 'Con OC') return `${doc.providerName} · OC ${doc.orderNumber}`;
    if (doc.entryType === 'Documento especial') return `${doc.documentType} · ${doc.providerName}`;
    if (doc.isPettyCash) return `${doc.providerName} · Caja Chica`;
    return `${doc.providerName} · Aprobó ${doc.approver ?? '—'}`;
  }

  openPanel(panel: AccountingPanel): void {
    this.resetPanels();
    this.panel.set(panel);
    if (panel === 'observe') this.email.set(this.detail()?.providerEmail ?? '');
  }

  closePanel(): void {
    this.resetPanels();
  }

  reject(): void {
    const doc = this.detail();
    const reason = this.reason().trim();
    if (!doc) return;
    if (!reason) {
      this.reasonInvalid.set(true);
      this.panelError.set('Ingresa el motivo del rechazo.');
      return;
    }
    this.run(this.rejectDocument.execute(doc.id, reason, 'contabilidad'), (updated) => ({
      kind: 'bad',
      title: 'Documento rechazado',
      text: `El documento ${updated.number} de ${updated.providerName} pasó a estado Rechazado.`,
      reason,
      mail: `Notificamos el rechazo por correo al proveedor${updated.providerEmail ? ` (${updated.providerEmail})` : ''}.`,
    }));
  }

  observe(): void {
    const doc = this.detail();
    const reason = this.reason().trim();
    const email = this.email().trim();
    if (!doc) return;
    const validEmail = isValidObservationEmail(email);
    this.reasonInvalid.set(!reason);
    this.emailInvalid.set(!validEmail);
    if (!reason || !validEmail) {
      this.panelError.set(
        !reason
          ? 'Ingresa el motivo de la observación.'
          : 'Ingresa un correo válido para enviar la observación.',
      );
      return;
    }
    this.run(this.observeDocument.execute(doc.id, reason, email), (updated) => ({
      kind: 'warn',
      title: 'Documento observado',
      text: `El documento ${updated.number} de ${updated.providerName} pasó a estado Observado.`,
      reason,
      mail: `Enviamos la observación a ${email}.`,
    }));
  }

  protected resetPanels(): void {
    this.panel.set(null);
    this.reason.set('');
    this.email.set('');
    this.panelError.set('');
    this.reasonInvalid.set(false);
    this.emailInvalid.set(false);
  }
}
