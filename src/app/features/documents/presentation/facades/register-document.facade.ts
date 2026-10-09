import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { userFacingMessage } from '../../../../shared/errors/user-facing-message';
import { fileSize } from '../../../../shared/utils/file-size.util';
import { money } from '../../../../shared/utils/money-format.util';
import { SessionFacade } from '../../../auth';
import { CatalogFacade } from '../../../catalog';
import { RegisterElectronicDocumentCommand } from '../../application/models/register-electronic-document.command';
import { RegisterSpecialDocumentCommand } from '../../application/models/register-special-document.command';
import {
  READ_ELECTRONIC_DOCUMENT,
  REGISTER_ELECTRONIC_DOCUMENT,
  REGISTER_SPECIAL_DOCUMENT,
  VALIDATE_PURCHASE_ORDER,
} from '../../di/documents.tokens';
import { DocumentRejectedError } from '../../domain/errors/document-rejected.error';
import { ElectronicDocument } from '../../domain/models/electronic-document';
import { OrderType } from '../../domain/models/order-type';
import { PortalDocument } from '../../domain/models/portal-document';
import { PurchaseOrder } from '../../domain/models/purchase-order';
import {
  SPECIAL_DOCUMENT_TYPES,
  canRegisterPettyCash,
  canRegisterSpecialDocuments,
  isInternalCollaborator,
} from '../../domain/rules/document-rules';
import {
  attachmentError,
  isCdrRequired,
  issuerMismatchError,
  parseAmount,
  seriesFromFileName,
} from '../../domain/rules/registration-rules';
import { ACCEPT } from '../catalog/accepted-extensions';
import { STATUS_TONE } from '../catalog/document-status-tones';
import { ENTRY_CARDS } from '../catalog/entry-cards';
import { ExtraFile } from '../components/file-drop/extra-file';
import { AttachmentSlot } from './attachment-slot';
import { RegisterEntry } from './register-entry';
import { RegisterResult } from './register-result';
import { ReviewAttachment } from './review-attachment';
import { SlotState } from './slot-state';
import { SpecialForm } from './special-form';

const EMPTY_SLOT: SlotState = { state: 'none', file: null, name: '', size: '', error: '' };

const EMPTY_SPECIAL: SpecialForm = {
  type: 'Boleto aéreo',
  ruc: '',
  date: '',
  number: '',
  amount: '',
  currency: 'PEN',
};

/** Estado de Registrar documentos: tipo de ingreso, datos, archivos, revisión y registro. */
@Injectable()
export class RegisterDocumentFacade {
  private readonly session = inject(SessionFacade);
  private readonly catalog = inject(CatalogFacade);
  private readonly validatePurchaseOrder = inject(VALIDATE_PURCHASE_ORDER);
  private readonly readElectronicDocument = inject(READ_ELECTRONIC_DOCUMENT);
  private readonly registerElectronicDocument = inject(REGISTER_ELECTRONIC_DOCUMENT);
  private readonly registerSpecialDocument = inject(REGISTER_SPECIAL_DOCUMENT);
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();

  readonly entry = signal<RegisterEntry>('oc');
  readonly step = signal<1 | 2 | 3>(1);
  readonly company = signal('');
  readonly orderType = signal<OrderType>('Servicio');
  readonly orderNumber = signal('');
  readonly orderState = signal<'idle' | 'busy' | 'ok' | 'bad'>('idle');
  readonly order = signal<PurchaseOrder | null>(null);
  readonly area = signal('');
  readonly approver = signal('');
  readonly slots = signal<Record<AttachmentSlot, SlotState>>({
    xml: EMPTY_SLOT,
    pdf: EMPTY_SLOT,
    cdr: EMPTY_SLOT,
  });
  readonly extras = signal<ExtraFile[]>([]);
  readonly extrasError = signal('');
  readonly xmlDocument = signal<ElectronicDocument | null>(null);
  readonly special = signal<SpecialForm>({ ...EMPTY_SPECIAL });
  readonly formError = signal('');
  readonly reviewLoading = signal(false);
  readonly registering = signal(false);
  readonly result = signal<RegisterResult | null>(null);
  readonly pettyCash = signal(false);

  readonly specialTypes = SPECIAL_DOCUMENT_TYPES;
  readonly accept = ACCEPT;
  readonly companyOptions = this.catalog.companyOptions;
  /** Correo de facturación de la sociedad elegida (recepción de comprobantes electrónicos). */
  readonly companyBillingEmail = computed(
    () => this.catalog.company(this.company())?.billingEmail ?? null,
  );
  /** Las áreas dependen de la sociedad elegida. */
  readonly areaOptions = computed(() => this.catalog.areaOptionsFor(this.company()));
  readonly approverOptions = computed(() =>
    this.catalog.approverOptions(this.area(), this.company()),
  );

  private readonly roles = computed(() => this.session.user()?.roles ?? []);
  readonly isInternal = computed(() => isInternalCollaborator(this.roles()));
  /** Los documentos especiales los registra personal interno, no el proveedor. */
  readonly entryCards = computed(() =>
    ENTRY_CARDS.filter(
      (card) =>
        card.value !== 'esp' || canRegisterSpecialDocuments(this.roles(), this.session.isAdmin()),
    ),
  );
  /** Solo el personal interno (o el administrador) puede registrar Caja Chica. */
  readonly canPettyCash = computed(() => canRegisterPettyCash(this.roles()));
  readonly locked = computed(
    () => this.step() > 1 || this.orderState() === 'busy' || this.registering(),
  );
  readonly steps = computed(() => {
    const labels =
      this.entry() === 'esp'
        ? ['Datos y archivo', 'Registro']
        : ['Datos y archivos', 'Revisión', 'Registro'];
    const current = this.entry() === 'esp' ? (this.result() ? 1 : 0) : this.step() - 1;
    const failed = this.result() && !this.result()!.ok;
    return labels.map((label, index) => ({
      label,
      current: index === current,
      done: index < current || (!!this.result()?.ok && index === current),
      failed: !!failed && index === current,
    }));
  });

  readonly series = computed(
    () => this.xmlDocument()?.series || seriesFromFileName(this.slots().xml.name) || '',
  );
  readonly cdrRequired = computed(() => isCdrRequired(this.series()));
  readonly filesLocked = computed(() => this.entry() === 'oc' && this.orderState() !== 'ok');
  readonly uploading = computed(
    () =>
      Object.values(this.slots()).some((slot) => slot.state === 'uploading') ||
      this.extras().some((extra) => extra.uploading),
  );
  /** Sin OC pasa por aprobación, salvo que sea de Caja Chica. */
  readonly pendingApproval = computed(() => this.entry() === 'sin' && !this.pettyCash());
  readonly statusOnRegister = computed(() =>
    this.pendingApproval() ? 'Pendiente de aprobación' : 'Pendiente de contabilización',
  );
  readonly statusTone = computed(() => STATUS_TONE[this.statusOnRegister()]);
  readonly isSettlement = computed(() => this.special().type === 'Liquidación de cobranzas');

  readonly reviewAttachments = computed(() => {
    const doc = this.xmlDocument();
    const number = doc?.number ?? 'documento';
    const slots = this.slots();
    const list: ReviewAttachment[] = [
      {
        tag: 'XML',
        name: slots.xml.name,
        detail: `Documento electrónico · ${slots.xml.size}`,
        status: 'Adjunto',
      },
      {
        tag: 'PDF',
        name: slots.pdf.name,
        detail: `Representación impresa · ${slots.pdf.size}`,
        status: 'Adjunto',
      },
      this.cdrRequired()
        ? {
            tag: 'CDR',
            name: slots.cdr.name,
            detail: `Constancia de recepción · ${slots.cdr.size}`,
            status: 'Adjunto',
          }
        : {
            tag: 'CDR',
            name: 'CDR no requerido',
            detail: `Serie ${this.series()} (comienza con E)`,
            status: 'No aplica',
            na: true,
          },
    ];
    const extras = this.extras();
    if (extras.length) {
      list.push({
        tag: 'PDF',
        name: `Anexos_${number}.pdf`,
        detail: `Consolidado de ${extras.length} ${extras.length === 1 ? 'archivo' : 'archivos'} · ${extras.map((extra) => extra.name).join(', ')}`,
        status: 'Adjunto',
        extra: true,
      });
    }
    return list;
  });

  readonly registrationRows = computed(() => {
    const rows = [
      {
        label: 'Tipo de ingreso',
        value: this.entry() === 'oc' ? 'Con orden de compra' : 'Sin orden de compra',
      },
      { label: 'Sociedad', value: this.catalog.company(this.company())?.name ?? '—' },
    ];
    const billingEmail = this.companyBillingEmail();
    if (billingEmail) rows.push({ label: 'Correo de facturación', value: billingEmail });
    if (this.entry() === 'oc') {
      rows.push({
        label: this.orderType() === 'Bien' ? 'N° de carrier' : 'N° de orden de compra',
        value: this.order()?.number ?? '',
      });
    }
    if (this.entry() === 'sin' && this.pettyCash()) {
      rows.push({ label: 'Caja Chica', value: 'Sí · sin aprobación' });
    }
    if (this.pendingApproval()) {
      rows.push({ label: 'Área', value: this.area() || '—' });
      const approver = this.catalog
        .approvers(this.area(), this.company())
        .find((item) => item.id === this.approver());
      rows.push({
        label: 'Aprobador',
        value: approver ? `${approver.name} · ${approver.email}` : '—',
      });
    }
    return rows;
  });

  readonly progressLabel = computed(() => {
    if (this.orderState() === 'busy') return 'Validando orden en SAP';
    if (this.registering()) return 'Validando documento';
    if (this.reviewLoading()) return 'Leyendo documento electrónico';
    return '';
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timers.forEach(clearTimeout));
  }

  start(): void {
    this.catalog.load();
  }

  // ——— Tipo de ingreso y datos ———

  pickEntry(entry: RegisterEntry): void {
    if (this.locked() || entry === this.entry()) return;
    this.resetForm();
    this.entry.set(entry);
  }

  setCompany(code: string): void {
    this.company.set(code);
    // El área es de la sociedad y el aprobador debe trabajar con ella.
    if (!this.catalog.areaOptionsFor(code).some((option) => option.value === this.area()))
      this.area.set('');
    if (!this.catalog.approvers(this.area(), code).some((item) => item.id === this.approver())) {
      this.approver.set('');
    }
    this.formError.set('');
    if (this.orderState() === 'bad') this.orderState.set('idle');
  }

  setOrderType(type: OrderType): void {
    if (this.orderState() === 'busy') return;
    this.orderType.set(type);
    this.orderNumber.set('');
    this.order.set(null);
    this.orderState.set('idle');
  }

  setOrderNumber(value: string): void {
    this.orderNumber.set(value);
    this.order.set(null);
    this.orderState.set('idle');
    this.formError.set('');
  }

  validateOrder(): void {
    if (this.orderState() === 'busy') return;
    if (!this.company() || !this.orderNumber().trim()) {
      this.formError.set('Selecciona la sociedad e ingresa el número.');
      return;
    }
    this.formError.set('');
    this.orderState.set('busy');
    this.validatePurchaseOrder
      .execute(this.company(), this.orderType(), this.orderNumber())
      .subscribe({
        next: (order) => {
          this.order.set(order);
          this.orderState.set(order ? 'ok' : 'bad');
        },
        error: (error) => {
          this.orderState.set('idle');
          this.formError.set(userFacingMessage(error, 'No fue posible validar la orden en SAP.'));
        },
      });
  }

  setArea(area: string): void {
    this.area.set(area);
    this.approver.set('');
    this.formError.set('');
  }

  setApprover(id: string): void {
    this.approver.set(id);
    this.formError.set('');
  }

  // ——— Archivos ———

  addFile(slot: AttachmentSlot, files: File[]): void {
    const file = files[0];
    const error = attachmentError(file, ACCEPT[slot]);
    if (error) {
      this.patchSlot(slot, { error });
      return;
    }
    this.formError.set('');
    this.patchSlot(slot, {
      state: 'uploading',
      file,
      name: file.name,
      size: fileSize(file.size),
      error: '',
    });
    if (slot === 'xml') void this.readXml(file);
    this.later(1150, () => this.patchSlot(slot, { state: 'ok' }));
  }

  removeFile(slot: AttachmentSlot): void {
    this.patchSlot(slot, { ...EMPTY_SLOT });
    if (slot === 'xml') this.xmlDocument.set(null);
  }

  addExtras(files: File[]): void {
    const invalid = files.find((file) => attachmentError(file, ACCEPT.extra));
    if (invalid) {
      this.extrasError.set(attachmentError(invalid, ACCEPT.extra));
      return;
    }
    this.extrasError.set('');
    const added = files.map((file) => ({ name: file.name, uploading: true, file }));
    this.extras.update((list) => [...list, ...added]);
    this.later(1150, () =>
      this.extras.update((list) => list.map((extra) => ({ ...extra, uploading: false }))),
    );
  }

  clearExtras(): void {
    this.extras.set([]);
    this.extrasError.set('');
  }

  // ——— Documentos especiales ———

  setSpecial<K extends keyof SpecialForm>(key: K, value: SpecialForm[K]): void {
    this.special.update((form) => ({ ...form, [key]: value }));
    this.formError.set('');
  }

  // ——— Navegación ———

  back(): void {
    if (this.entry() === 'esp') {
      this.special.update((form) => ({ ...EMPTY_SPECIAL, type: form.type }));
      this.patchSlot('pdf', { ...EMPTY_SLOT });
      this.formError.set('');
    } else if (this.step() === 1) {
      this.resetForm();
    } else if (!this.registering()) {
      this.step.set(1);
    }
  }

  next(): void {
    if (this.entry() === 'esp' || this.step() === 2) this.register();
    else this.goToReview();
  }

  reset(): void {
    this.resetForm();
  }

  private goToReview(): void {
    const missing: string[] = [];
    if (!this.company()) missing.push('sociedad');
    if (this.entry() === 'oc' && this.orderState() !== 'ok') missing.push('orden validada');
    if (this.pendingApproval() && (!this.area() || !this.approver()))
      missing.push('área y aprobador');
    const slots = this.slots();
    const filesReady =
      slots.xml.state === 'ok' &&
      slots.pdf.state === 'ok' &&
      (!this.cdrRequired() || slots.cdr.state === 'ok');
    if (!filesReady || this.uploading()) missing.push('archivos requeridos');
    if (missing.length) {
      this.formError.set(`Falta: ${missing.join(', ')}.`);
      return;
    }
    if (slots.xml.error) {
      this.formError.set('Revisa el archivo XML antes de continuar.');
      return;
    }
    this.formError.set('');
    this.step.set(2);
    this.reviewLoading.set(true);
    this.later(850, () => this.reviewLoading.set(false));
  }

  private register(): void {
    if (this.registering()) return;
    const isSpecial = this.entry() === 'esp';
    const request = isSpecial ? this.specialCommand() : this.electronicCommand();
    if (!request) return;
    const call =
      'type' in request
        ? this.registerSpecialDocument.execute(request)
        : this.registerElectronicDocument.execute(request);
    this.formError.set('');
    this.registering.set(true);
    call.subscribe({
      next: (saved) => {
        this.registering.set(false);
        this.result.set(this.successResult(saved));
        if (!isSpecial) this.step.set(3);
      },
      error: (error) => {
        this.registering.set(false);
        const fallback = 'No fue posible registrar el documento.';
        if (error instanceof DocumentRejectedError) {
          this.result.set(this.failureResult(error.message || fallback));
          if (!isSpecial) this.step.set(3);
        } else {
          this.formError.set(userFacingMessage(error, fallback));
        }
      },
    });
  }

  private electronicCommand(): RegisterElectronicDocumentCommand | null {
    const slots = this.slots();
    const order = this.order();
    if (!this.xmlDocument() || !slots.xml.file || !slots.pdf.file) {
      this.formError.set('No pudimos leer el documento electrónico. Vuelve a adjuntar el XML.');
      return null;
    }
    if (this.entry() === 'oc' && !order) {
      this.formError.set('Valida la orden antes de registrar el documento.');
      return null;
    }
    return {
      entryType: this.entry() === 'oc' ? 'Con OC' : 'Sin OC',
      companyCode: this.company(),
      isPettyCash: this.entry() === 'sin' && this.pettyCash(),
      order:
        this.entry() === 'oc' && order ? { type: order.type, number: order.number } : undefined,
      approverId: this.pendingApproval() ? this.approver() : undefined,
      xml: slots.xml.file,
      pdf: slots.pdf.file,
      cdr: this.cdrRequired() && slots.cdr.file ? slots.cdr.file : undefined,
      extras: this.extras().flatMap((extra) => (extra.file ? [extra.file] : [])),
    };
  }

  private specialCommand(): RegisterSpecialDocumentCommand | null {
    const form = this.special();
    const amount = parseAmount(form.amount);
    const pdf = this.slots().pdf;
    if (
      !this.company() ||
      form.ruc.length !== 11 ||
      !form.date ||
      !form.number.trim() ||
      !(amount > 0) ||
      pdf.state !== 'ok' ||
      !pdf.file
    ) {
      this.formError.set('Completa la sociedad, los datos del documento y adjunta el PDF.');
      return null;
    }
    return {
      companyCode: this.company(),
      type: form.type,
      providerRuc: form.ruc,
      issuedAt: form.date,
      number: form.number.trim(),
      amount,
      currency: form.currency,
      pdf: pdf.file,
    };
  }

  private successResult(doc: PortalDocument): RegisterResult {
    const company = doc.companyName;
    if (doc.entryType === 'Documento especial') {
      return {
        ok: true,
        title: 'Documento registrado',
        text: `El ${doc.documentType.toLowerCase()} ${doc.number} se registró correctamente con estado ${doc.status}.`,
        chips: [
          { label: 'N° de documento', value: doc.number },
          { label: 'Sociedad', value: company },
          { label: 'Estado', value: doc.status, tone: 'info' },
        ],
        mail: '',
      };
    }
    const pending = doc.status === 'Pendiente de aprobación';
    return {
      ok: true,
      title: pending ? 'Documento registrado y enviado a aprobación' : 'Documento registrado',
      text: `El documento ${doc.number} se registró correctamente con estado ${doc.status}.`,
      chips: [
        { label: 'N° de documento', value: doc.number },
        { label: 'Sociedad', value: company },
        doc.entryType === 'Con OC'
          ? {
              label: doc.orderType === 'Bien' ? 'N° de carrier' : 'Orden de compra',
              value: doc.orderNumber ?? '',
            }
          : { label: 'Total', value: money(doc.currency, doc.amount) },
        { label: 'Estado', value: doc.status, tone: pending ? 'warn' : 'info' },
      ],
      mail: pending
        ? `Enviamos un correo a ${doc.approver} (${doc.approverEmail}) para que apruebe el documento.`
        : '',
    };
  }

  private failureResult(message: string): RegisterResult {
    if (this.entry() === 'esp') {
      return {
        ok: false,
        title: 'Documento no válido',
        text: message,
        chips: [
          { label: 'N° de documento', value: this.special().number.trim().toUpperCase() },
          {
            label: 'Validación',
            value: this.isSettlement() ? 'SAP + SUNAT' : 'Duplicidad en SAP',
            tone: 'danger',
          },
        ],
        mail: '',
      };
    }
    return {
      ok: false,
      title: 'Documento electrónico no válido o ya registrado',
      text: `${message} No se registró el documento${this.pendingApproval() ? ' ni se envió a aprobación' : ''}.`,
      chips: [
        { label: 'N° de documento', value: this.xmlDocument()?.number ?? '' },
        { label: 'Sociedad', value: this.catalog.company(this.company())?.name ?? '' },
        { label: 'Respuesta SAP', value: 'Documento no válido o duplicado', tone: 'danger' },
      ],
      mail: '',
    };
  }

  // ——— Utilidades ———

  private async readXml(file: File): Promise<void> {
    this.xmlDocument.set(null);
    const user = this.session.user();
    const company = this.catalog.company(this.company());
    const doc = await this.readElectronicDocument.execute(file, {
      entry: this.entry() === 'oc' ? 'Con OC' : 'Sin OC',
      issuerName: user?.name ?? '',
      issuerRuc: user?.providerId ?? '',
      receiverName: company?.name ?? '',
      receiverRuc: company?.ruc ?? '',
    });
    if (this.slots().xml.file !== file) return;
    this.xmlDocument.set(doc);
    const providerRuc = user?.roles.includes('Proveedor') ? user.providerId : undefined;
    const mismatch = issuerMismatchError(doc, providerRuc);
    if (mismatch) this.patchSlot('xml', { error: mismatch });
  }

  private patchSlot(slot: AttachmentSlot, patch: Partial<SlotState>): void {
    this.slots.update((slots) => ({ ...slots, [slot]: { ...slots[slot], ...patch } }));
  }

  private later(ms: number, action: () => void): void {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      action();
    }, ms);
    this.timers.add(timer);
  }

  private resetForm(): void {
    this.step.set(1);
    this.company.set('');
    this.orderType.set('Servicio');
    this.orderNumber.set('');
    this.order.set(null);
    this.orderState.set('idle');
    this.area.set('');
    this.approver.set('');
    this.slots.set({ xml: EMPTY_SLOT, pdf: EMPTY_SLOT, cdr: EMPTY_SLOT });
    this.extras.set([]);
    this.extrasError.set('');
    this.xmlDocument.set(null);
    this.special.update((form) => ({ ...EMPTY_SPECIAL, type: form.type }));
    this.formError.set('');
    this.reviewLoading.set(false);
    this.pettyCash.set(false);
    this.result.set(null);
  }
}
