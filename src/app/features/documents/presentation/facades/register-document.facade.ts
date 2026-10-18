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
  canRegisterSpecialDocuments,
  canRegisterWithPurchaseOrder,
  isInternalCollaborator,
  needsApprover,
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
import { RegisterCheck } from './register-check';
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

/** Estado de Registrar documentos: tipo de ingreso, datos, archivos y registro (un solo paso). */
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
  readonly registering = signal(false);
  readonly result = signal<RegisterResult | null>(null);

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
  /** Con OC: proveedor (flujo 01); especiales: personal interno (flujo 03); el administrador, todos. */
  readonly entryCards = computed(() => {
    const roles = this.roles();
    const isAdmin = this.session.isAdmin();
    const direct = !needsApprover(roles, isAdmin);
    return ENTRY_CARDS.filter((card) =>
      card.value === 'oc'
        ? canRegisterWithPurchaseOrder(roles, isAdmin)
        : card.value === 'esp'
          ? canRegisterSpecialDocuments(roles, isAdmin)
          : true,
    ).map((card) =>
      direct && card.directDescription ? { ...card, description: card.directDescription } : card,
    );
  });
  readonly locked = computed(() => this.orderState() === 'busy' || this.registering());
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
  /** Sin OC del proveedor pasa por aprobación; el del usuario interno va directo a contabilización (flujo 02). */
  readonly pendingApproval = computed(
    () => this.entry() === 'sin' && needsApprover(this.roles(), this.session.isAdmin()),
  );
  readonly statusOnRegister = computed(() =>
    this.pendingApproval() ? 'Pendiente de aprobación' : 'Pendiente de contabilización',
  );
  readonly statusTone = computed(() => STATUS_TONE[this.statusOnRegister()]);
  readonly isSettlement = computed(() => this.special().type === 'Liquidación de cobranzas');

  readonly progressLabel = computed(() => {
    if (this.orderState() === 'busy') return 'Validando orden en SAP';
    if (this.registering()) return 'Registrando documento';
    return '';
  });

  /** Requisitos para registrar: el pie los muestra como segmentos («Faltan N pasos»). */
  readonly checks = computed<RegisterCheck[]>(() => {
    const slots = this.slots();
    const entry = this.entry();
    const checks: RegisterCheck[] = [{ label: 'Sociedad', ok: !!this.company() }];
    if (entry === 'oc') checks.push({ label: 'Orden validada', ok: this.orderState() === 'ok' });
    if (this.pendingApproval())
      checks.push({ label: 'Área y aprobador', ok: !!(this.area() && this.approver()) });
    if (entry === 'esp') {
      const form = this.special();
      checks.push({
        label: 'Datos del documento',
        ok:
          form.ruc.length === 11 &&
          !!form.date &&
          !!form.number.trim() &&
          parseAmount(form.amount) > 0,
      });
      checks.push({ label: 'PDF', ok: slots.pdf.state === 'ok' });
      return checks;
    }
    checks.push({ label: 'XML', ok: slots.xml.state === 'ok' && !slots.xml.error });
    checks.push({ label: 'PDF', ok: slots.pdf.state === 'ok' });
    if (this.cdrRequired()) checks.push({ label: 'CDR de SUNAT', ok: slots.cdr.state === 'ok' });
    return checks;
  });
  readonly missing = computed(() => this.checks().filter((check) => !check.ok));
  readonly ready = computed(() => !this.missing().length && !this.uploading());
  readonly statusText = computed(() => {
    const count = this.missing().length;
    if (!count) return this.uploading() ? 'Subiendo archivos…' : 'Todo listo para registrar';
    return count === 1 ? 'Falta 1 paso' : `Faltan ${count} pasos`;
  });
  /** Archivos requeridos cargados («2 de 3»). */
  readonly filesProgress = computed(() => {
    const files = this.checks().filter((check) =>
      ['XML', 'PDF', 'CDR de SUNAT'].includes(check.label),
    );
    return `${files.filter((check) => check.ok).length} de ${files.length}`;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timers.forEach(clearTimeout));
  }

  start(): void {
    this.catalog.load();
    // El usuario interno no registra Con OC: empieza en el primer tipo que puede usar.
    const cards = this.entryCards();
    if (cards.length && !cards.some((card) => card.value === this.entry()))
      this.entry.set(cards[0].value);
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
    const added = files.map((file) => ({
      name: file.name,
      size: fileSize(file.size),
      uploading: true,
      file,
    }));
    this.extras.update((list) => [...list, ...added]);
    this.later(1150, () =>
      this.extras.update((list) => list.map((extra) => ({ ...extra, uploading: false }))),
    );
  }

  removeExtra(index: number): void {
    this.extras.update((list) => list.filter((_, i) => i !== index));
    this.extrasError.set('');
  }

  // ——— Documentos especiales ———

  setSpecial<K extends keyof SpecialForm>(key: K, value: SpecialForm[K]): void {
    this.special.update((form) => ({ ...form, [key]: value }));
    this.formError.set('');
  }

  // ——— Registro ———

  /** Registra si están todos los requisitos; si no, dice qué falta. */
  register(): void {
    if (this.registering()) return;
    if (this.uploading()) {
      this.formError.set('Espera a que terminen de subir los archivos.');
      return;
    }
    const missing = this.missing();
    if (missing.length) {
      const names = missing.map((check) =>
        /^[A-Z]{3}/.test(check.label) ? check.label : check.label.toLowerCase(),
      );
      this.formError.set(`Falta completar: ${names.join(', ')}.`);
      return;
    }
    this.submit();
  }

  /** Tras un rechazo de SAP/SUNAT: vuelve al formulario con los mismos datos para corregirlos. */
  retry(): void {
    this.result.set(null);
    this.formError.set('');
  }

  reset(): void {
    this.resetForm();
  }

  private submit(): void {
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
      },
      error: (error) => {
        this.registering.set(false);
        const fallback = 'No fue posible registrar el documento.';
        if (error instanceof DocumentRejectedError) {
          this.result.set(this.failureResult(error.message || fallback));
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
    if (!doc.fromXml) {
      this.patchSlot('xml', {
        error: 'No pudimos leer el XML. Verifica que sea la factura electrónica (UBL 2.1).',
      });
      return;
    }
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
    this.result.set(null);
  }
}
