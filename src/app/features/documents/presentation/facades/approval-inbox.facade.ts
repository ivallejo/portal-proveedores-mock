import { Injectable, computed, inject, signal } from '@angular/core';
import { CatalogFacade } from '../../../catalog';
import { APPROVE_DOCUMENT, REASSIGN_DOCUMENT, REJECT_DOCUMENT } from '../../di/documents.tokens';
import { ApprovalReferenceType } from '../../domain/models/approval-reference-type';
import { APPROVAL_STATUSES, countWithStatus } from '../../domain/rules/document-rules';
import { statusOptions } from '../catalog/status-options.util';
import { ApprovalActionResult } from './approval-action-result';
import { ApprovalPanel } from './approval-panel';
import { DocumentInboxFacade } from './document-inbox.facade';

/** Documentos por aprobar: la bandeja del aprobador con aprobar, reasignar y rechazar. */
@Injectable()
export class ApprovalInboxFacade extends DocumentInboxFacade<ApprovalActionResult> {
  private readonly approveDocument = inject(APPROVE_DOCUMENT);
  private readonly reassignDocument = inject(REASSIGN_DOCUMENT);
  private readonly rejectDocument = inject(REJECT_DOCUMENT);
  private readonly catalog = inject(CatalogFacade);

  protected readonly inbox = 'Approvals';
  readonly statusOptions = statusOptions(APPROVAL_STATUSES);

  readonly panel = signal<ApprovalPanel>(null);
  readonly referenceType = signal<ApprovalReferenceType>('pedido');
  readonly reference = signal('');
  readonly referenceError = signal(false);
  readonly reassignArea = signal('');
  readonly reassignApprover = signal('');
  readonly reassignError = signal(false);
  readonly reassignReason = signal('');
  readonly reason = signal('');
  readonly reasonError = signal(false);

  /** Para reasignar: áreas de la sociedad del documento. */
  readonly areaOptions = computed(() =>
    this.catalog.areaOptionsFor(this.detail()?.companyCode ?? ''),
  );
  readonly approverOptions = computed(() =>
    this.catalog.approverOptions(
      this.reassignArea(),
      this.detail()?.companyCode ?? '',
      this.detail()?.approver ?? '',
    ),
  );

  readonly kpis = computed(() => {
    const count = (status: Parameters<typeof countWithStatus>[1]) =>
      String(countWithStatus(this.rows(), status));
    return {
      pending: count('Pendiente de aprobación'),
      approved: count('Aprobado'),
      accounting: count('Pendiente de contabilización'),
      rejected: count('Rechazado'),
    };
  });
  readonly isPending = computed(() => this.detail()?.status === 'Pendiente de aprobación');
  readonly isXml = computed(() => this.detail()?.entryType !== 'Documento especial');
  readonly referenceLabel = computed(() =>
    this.referenceType() === 'viaje' ? 'N° de viaje' : 'N° de pedido',
  );
  readonly footNote = computed(() => {
    if (this.result()) return 'El listado ya refleja el nuevo estado del documento.';
    if (!this.isPending()) return 'Documento sin acciones pendientes.';
    return this.panel()
      ? 'Completa la acción o cancélala para volver.'
      : 'Al aprobar, el documento pasa a Pendiente de contabilización.';
  });

  /** Carga el catálogo (para reasignar) y la bandeja. */
  start(): void {
    this.catalog.load();
    this.search();
  }

  openPanel(panel: ApprovalPanel): void {
    this.resetPanels();
    this.panel.set(panel);
  }

  closePanel(): void {
    this.resetPanels();
  }

  setReference(value: string): void {
    this.reference.set(value);
    this.referenceError.set(false);
  }

  setReassignArea(area: string): void {
    this.reassignArea.set(area);
    this.reassignApprover.set('');
    this.reassignError.set(false);
  }

  approve(): void {
    const doc = this.detail();
    const reference = this.reference().trim();
    if (!doc) return;
    if (!reference) {
      this.referenceError.set(true);
      return;
    }
    const label = this.referenceLabel();
    this.run(this.approveDocument.execute(doc.id, this.referenceType(), reference), (updated) => ({
      kind: 'ok',
      title: 'Documento aprobado',
      text: `El documento ${updated.number} fue aprobado con ${label} ${reference} y se envió a contabilización. Su estado ahora es Pendiente de contabilización.`,
      mail: 'Se notificó al área de Contabilidad.',
    }));
  }

  reassign(): void {
    const doc = this.detail();
    if (!doc) return;
    if (!this.reassignArea() || !this.reassignApprover() || !this.reassignReason().trim()) {
      this.reassignError.set(true);
      return;
    }
    const area = this.reassignArea();
    const approverId = this.reassignApprover();
    const approver =
      this.catalog.approvers(area, doc.companyCode).find((item) => item.id === approverId)?.name ??
      '';
    const reason = this.reassignReason().trim();
    this.run(this.reassignDocument.execute(doc.id, approverId, reason), (updated) => ({
      kind: 'swap',
      title: 'Documento reasignado',
      text: `El documento ${updated.number} fue reasignado a ${approver} (${area}).`,
      mail: `Enviamos un correo a ${approver} indicando que tiene un documento por aprobar.`,
    }));
  }

  reject(): void {
    const doc = this.detail();
    const reason = this.reason().trim();
    if (!doc) return;
    if (!reason) {
      this.reasonError.set(true);
      return;
    }
    this.run(this.rejectDocument.execute(doc.id, reason, 'aprobador'), (updated) => ({
      kind: 'bad',
      title: 'Documento rechazado',
      text: `El documento ${updated.number} de ${updated.providerName} fue rechazado.`,
      mail: 'Enviamos un correo al proveedor notificando el rechazo.',
    }));
  }

  protected resetPanels(): void {
    this.panel.set(null);
    this.referenceType.set('pedido');
    this.reference.set('');
    this.referenceError.set(false);
    this.reassignArea.set('');
    this.reassignApprover.set('');
    this.reassignError.set(false);
    this.reassignReason.set('');
    this.reason.set('');
    this.reasonError.set(false);
  }
}
