import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { PageLoadingService } from '../../core/layout/page-loading.service';
import {
  approverEmail,
  approverOptions,
  areaOptions,
  companyByCode,
  companyOptions,
} from '../../shared/data/catalog';
import {
  ATTACHMENT_TONE,
  Attachment,
  EntryType,
  PortalDocument,
  SPECIAL_DOCUMENT_TYPES,
  STATUS_TONE,
  SpecialDocumentType,
} from '../../shared/documents/document.model';
import { DocumentsService } from '../../shared/documents/documents.service';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import {
  CalloutComponent,
  ResultStateComponent,
} from '../../shared/ui/feedback/feedback.components';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { IconName } from '../../shared/ui/icon/icons';
import { PageHeaderComponent } from '../../shared/ui/page/page.components';
import { SelectComponent } from '../../shared/ui/select/select.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import {
  Currency,
  currencyName,
  fileSize,
  formatDate,
  money,
  onlyDigits,
  todayIso,
} from '../../shared/utils/format';
import { ExtraFile, FileDropComponent, FileState } from './file-drop.component';
import { OrderInfo, OrderType, RegisterDocumentService } from './register-document.service';
import { ElectronicDocument } from './xml-reader';

type Entry = 'oc' | 'sin' | 'esp';
type Slot = 'xml' | 'pdf' | 'cdr';

interface SlotState {
  state: FileState;
  file: File | null;
  name: string;
  size: string;
  error: string;
}

interface SpecialForm {
  type: SpecialDocumentType;
  ruc: string;
  date: string;
  number: string;
  amount: string;
  currency: Currency;
}

interface RegisterResult {
  ok: boolean;
  title: string;
  text: string;
  chips: { label: string; value: string; tone?: 'info' | 'warn' | 'danger' }[];
  mail: string;
}

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPT: Record<Slot | 'extra', string[]> = {
  xml: ['.xml'],
  pdf: ['.pdf'],
  cdr: ['.zip', '.xml'],
  extra: ['.pdf'],
};
const EMPTY_SLOT: SlotState = { state: 'none', file: null, name: '', size: '', error: '' };
const EMPTY_SPECIAL: SpecialForm = {
  type: 'Boleto aéreo',
  ruc: '',
  date: '',
  number: '',
  amount: '',
  currency: 'PEN',
};
const ENTRY_CARDS: { value: Entry; label: string; description: string; icon: IconName }[] = [
  {
    value: 'oc',
    label: 'Con orden de compra',
    description: 'Factura asociada a una orden de bien (carrier) o de servicio.',
    icon: 'cart',
  },
  {
    value: 'sin',
    label: 'Sin orden de compra',
    description: 'Factura o recibo sin OC que requiere aprobación de un área.',
    icon: 'file-text',
  },
  {
    value: 'esp',
    label: 'Documentos especiales',
    description: 'Boletos aéreos, recibos públicos, no domiciliados y liquidaciones.',
    icon: 'star',
  },
];

@Component({
  selector: 'app-register-document-page',
  imports: [
    PageHeaderComponent,
    SelectComponent,
    BadgeComponent,
    IconComponent,
    SpinnerComponent,
    CalloutComponent,
    ResultStateComponent,
    FileDropComponent,
    RouterLink,
    NgTemplateOutlet,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register-document-page.component.html',
})
export class RegisterDocumentPageComponent {
  private readonly auth = inject(AuthService);
  private readonly api = inject(RegisterDocumentService);
  private readonly documents = inject(DocumentsService);
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();

  readonly entry = signal<Entry>('oc');
  readonly step = signal<1 | 2 | 3>(1);
  readonly company = signal('');
  readonly orderType = signal<OrderType>('Servicio');
  readonly orderNumber = signal('');
  readonly orderState = signal<'idle' | 'busy' | 'ok' | 'bad'>('idle');
  readonly order = signal<OrderInfo | null>(null);
  readonly area = signal('');
  readonly approver = signal('');
  readonly slots = signal<Record<Slot, SlotState>>({
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

  readonly specialTypes = SPECIAL_DOCUMENT_TYPES;
  readonly companyOptions = companyOptions();
  readonly areaOptions = areaOptions();
  readonly approverOptions = computed(() => approverOptions(this.area()));
  readonly accept = ACCEPT;
  readonly attachmentTone = ATTACHMENT_TONE;
  readonly money = money;
  readonly formatDate = formatDate;
  readonly currencyName = currencyName;

  readonly isInternal = computed(() => {
    const roles = this.auth.user()?.roles ?? [];
    return roles.includes('Colaborador interno') && !roles.includes('Proveedor');
  });
  /** Los documentos especiales los registra personal interno, no el proveedor. */
  readonly entryCards = computed(() =>
    ENTRY_CARDS.filter((card) => card.value !== 'esp' || this.isInternal() || this.auth.isAdmin()),
  );
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

  readonly series = computed(() => {
    const parsed = this.xmlDocument()?.series;
    if (parsed) return parsed;
    const match = /([A-Z0-9]{4})-\d/i.exec(this.slots().xml.name);
    return match ? match[1].toUpperCase() : '';
  });
  readonly cdrRequired = computed(() => !this.series().startsWith('E'));
  readonly filesLocked = computed(() => this.entry() === 'oc' && this.orderState() !== 'ok');
  readonly uploading = computed(
    () =>
      Object.values(this.slots()).some((slot) => slot.state === 'uploading') ||
      this.extras().some((extra) => extra.uploading),
  );
  readonly pendingApproval = computed(() => this.entry() === 'sin' && !this.isInternal());
  readonly statusOnRegister = computed(() =>
    this.pendingApproval() ? 'Pendiente de aprobación' : 'Pendiente de contabilización',
  );
  readonly statusTone = computed(() => STATUS_TONE[this.statusOnRegister()]);
  readonly isSettlement = computed(() => this.special().type === 'Liquidación de cobranzas');

  readonly reviewAttachments = computed(() => {
    const doc = this.xmlDocument();
    const number = doc?.number ?? 'documento';
    const slots = this.slots();
    const list: {
      tag: Attachment['tag'];
      name: string;
      detail: string;
      status: string;
      na?: boolean;
      extra?: boolean;
    }[] = [
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
      list.push(
        this.entry() === 'sin'
          ? {
              tag: 'PDF',
              name: `Anexos_${number}.pdf`,
              detail: `Consolidado de ${extras.length} ${extras.length === 1 ? 'archivo' : 'archivos'} · ${extras.map((extra) => extra.name).join(', ')}`,
              status: 'Adjunto',
              extra: true,
            }
          : {
              tag: 'PDF',
              name: extras.map((extra) => extra.name).join(', '),
              detail: `${extras.length} archivo(s) de sustento`,
              status: 'Adjunto',
              extra: true,
            },
      );
    }
    return list;
  });

  readonly registrationRows = computed(() => {
    const rows = [
      {
        label: 'Tipo de ingreso',
        value: this.entry() === 'oc' ? 'Con orden de compra' : 'Sin orden de compra',
      },
      { label: 'Sociedad', value: companyByCode(this.company())?.name ?? '—' },
    ];
    if (this.entry() === 'oc') {
      rows.push({
        label: this.orderType() === 'Bien' ? 'N° de carrier' : 'N° de orden de compra',
        value: this.order()?.number ?? '',
      });
    }
    if (this.pendingApproval()) {
      rows.push({ label: 'Área', value: this.area() || '—' });
      rows.push({
        label: 'Aprobador',
        value: this.approver()
          ? `${this.approver()} · ${approverEmail(this.area(), this.approver())}`
          : '—',
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
    const loading = inject(PageLoadingService);
    loading.bind(
      computed(() => !!this.progressLabel()),
      this.progressLabel,
    );
    inject(DestroyRef).onDestroy(() => this.timers.forEach(clearTimeout));
  }

  // ——— Tipo de ingreso y datos ———

  pickEntry(entry: Entry): void {
    if (this.locked() || entry === this.entry()) return;
    this.resetForm();
    this.entry.set(entry);
  }

  setCompany(code: string): void {
    this.company.set(code);
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

  onOrderNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase().slice(0, 16);
    this.orderNumber.set(input.value);
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
    this.api
      .validateOrder(this.company(), this.orderType(), this.orderNumber())
      .subscribe((order) => {
        this.order.set(order);
        this.orderState.set(order ? 'ok' : 'bad');
      });
  }

  setArea(area: string): void {
    this.area.set(area);
    this.approver.set('');
    this.formError.set('');
  }

  setApprover(name: string): void {
    this.approver.set(name);
    this.formError.set('');
  }

  // ——— Archivos ———

  addFile(slot: Slot, files: File[]): void {
    const file = files[0];
    const error = this.fileError(file, ACCEPT[slot]);
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

  removeFile(slot: Slot): void {
    this.patchSlot(slot, { ...EMPTY_SLOT });
    if (slot === 'xml') this.xmlDocument.set(null);
  }

  addExtras(files: File[]): void {
    const invalid = files.find((file) => this.fileError(file, ACCEPT.extra));
    if (invalid) {
      this.extrasError.set(this.fileError(invalid, ACCEPT.extra));
      return;
    }
    this.extrasError.set('');
    const added = files.map((file) => ({ name: file.name, uploading: true }));
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

  onSpecialRuc(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = onlyDigits(input.value);
    this.setSpecial('ruc', input.value);
  }

  onSpecialNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase().slice(0, 20);
    this.setSpecial('number', input.value);
  }

  onSpecialAmount(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^\d.,]/g, '').slice(0, 14);
    this.setSpecial('amount', input.value);
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
    const doc = this.entry() === 'esp' ? this.buildSpecial() : this.buildElectronic();
    if (!doc) return;
    this.formError.set('');
    this.registering.set(true);
    this.documents.register(doc).subscribe({
      next: (saved) => {
        this.registering.set(false);
        this.result.set(this.successResult(saved));
        if (this.entry() !== 'esp') this.step.set(3);
      },
      error: () => {
        this.registering.set(false);
        this.result.set(this.failureResult(doc));
        if (this.entry() !== 'esp') this.step.set(3);
      },
    });
  }

  private buildElectronic(): PortalDocument | null {
    const xml = this.xmlDocument();
    const user = this.auth.user();
    if (!xml || !user) {
      this.formError.set('No pudimos leer el documento electrónico. Vuelve a adjuntar el XML.');
      return null;
    }
    const entryType: EntryType = this.entry() === 'oc' ? 'Con OC' : 'Sin OC';
    const slots = this.slots();
    const attachments: Attachment[] = [
      { tag: 'XML', name: slots.xml.name },
      { tag: 'PDF', name: slots.pdf.name },
    ];
    if (this.cdrRequired()) attachments.push({ tag: 'CDR', name: slots.cdr.name });
    if (this.extras().length) {
      if (entryType === 'Sin OC')
        attachments.push({ tag: 'PDF', name: `Anexos_${xml.number}.pdf` });
      else this.extras().forEach((extra) => attachments.push({ tag: 'PDF', name: extra.name }));
    }
    const doc: PortalDocument = {
      number: xml.number,
      entryType,
      documentType: xml.documentType,
      providerName: xml.issuerName || user.name,
      providerRuc: xml.issuerRuc || user.providerId || '',
      providerEmail: user.email ?? '',
      currency: xml.currency,
      subtotal: xml.subtotal,
      igv: xml.igv,
      amount: xml.total,
      items: xml.items,
      concept: xml.items.map((item) => item.description).join('; '),
      issuedAt: xml.issuedAt || todayIso(),
      registeredAt: todayIso(),
      registeredBy: `${user.name} (${this.isInternal() ? 'interno' : 'proveedor'})`,
      companyCode: this.company(),
      status: this.statusOnRegister(),
      attachments,
      history: [],
    };
    if (entryType === 'Con OC') {
      const order = this.order()!;
      Object.assign(doc, {
        orderType: order.type,
        orderNumber: order.number,
        orderBalance: order.balance,
        orderDescription: order.description,
      });
    }
    if (this.pendingApproval()) {
      Object.assign(doc, {
        area: this.area(),
        approver: this.approver(),
        approverEmail: approverEmail(this.area(), this.approver()),
      });
    }
    doc.history = this.documents.registrationHistory(doc, 'Documento validado en SAP y SUNAT');
    return doc;
  }

  private buildSpecial(): PortalDocument | null {
    const form = this.special();
    const amount = Number(form.amount.replace(/,/g, ''));
    if (
      !this.company() ||
      form.ruc.length !== 11 ||
      !form.date ||
      !form.number.trim() ||
      !(amount > 0) ||
      this.slots().pdf.state !== 'ok'
    ) {
      this.formError.set('Completa la sociedad, los datos del documento y adjunta el PDF.');
      return null;
    }
    const user = this.auth.user();
    const validation = this.isSettlement()
      ? 'Válido en SUNAT y sin duplicidad en SAP (Servicio 02)'
      : 'Sin duplicidad en SAP (Servicio 02)';
    const doc: PortalDocument = {
      number: form.number.trim(),
      entryType: 'Documento especial',
      documentType: form.type,
      providerName: `Proveedor RUC ${form.ruc}`,
      providerRuc: form.ruc,
      providerEmail: '',
      currency: form.currency,
      subtotal: amount,
      igv: null,
      amount,
      items: [],
      concept: `${form.type} ${form.number.trim()}`,
      issuedAt: form.date,
      registeredAt: todayIso(),
      registeredBy: `${user?.name ?? 'Usuario'} (interno)`,
      companyCode: this.company(),
      status: 'Pendiente de contabilización',
      validation,
      attachments: [{ tag: 'PDF', name: this.slots().pdf.name }],
      history: [],
    };
    doc.history = this.documents.registrationHistory(
      doc,
      this.isSettlement() ? 'Validado en SUNAT y SAP' : 'Duplicidad validada en SAP',
    );
    return doc;
  }

  private successResult(doc: PortalDocument): RegisterResult {
    const company = companyByCode(doc.companyCode)?.name ?? '';
    if (doc.entryType === 'Documento especial') {
      return {
        ok: true,
        title: 'Documento registrado',
        text: `El ${doc.documentType.toLowerCase()} ${doc.number} se registró correctamente con estado Pendiente de contabilización.`,
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

  private failureResult(doc: PortalDocument): RegisterResult {
    const company = companyByCode(doc.companyCode)?.name ?? '';
    if (doc.entryType === 'Documento especial') {
      return {
        ok: false,
        title: 'Documento no válido',
        text: this.isSettlement()
          ? `SUNAT no reconoce la liquidación de cobranza ${doc.number} para el RUC ${doc.providerRuc}, o ya fue registrada en SAP. Verifica los datos del documento.`
          : `Ya existe un documento ${doc.number} registrado para el RUC ${doc.providerRuc}. Verifica el número del documento.`,
        chips: [
          { label: 'N° de documento', value: doc.number },
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
      text: `SAP rechazó el documento ${doc.number}: ya fue registrado anteriormente para ${company} o su contenido no coincide con la validación de SUNAT.${doc.entryType === 'Sin OC' ? ' No se registró el documento ni se envió a aprobación.' : ' No se registró el documento.'}`,
      chips: [
        { label: 'N° de documento', value: doc.number },
        { label: 'Sociedad', value: company },
        { label: 'Respuesta SAP', value: 'Documento duplicado', tone: 'danger' },
      ],
      mail: '',
    };
  }

  // ——— Utilidades ———

  private async readXml(file: File): Promise<void> {
    this.xmlDocument.set(null);
    const user = this.auth.user();
    const company = companyByCode(this.company());
    const doc = await this.api.readXml(file, {
      entry: this.entry() === 'oc' ? 'Con OC' : 'Sin OC',
      issuerName: user?.name ?? '',
      issuerRuc: user?.providerId ?? '',
      receiverName: company?.name ?? '',
      receiverRuc: company?.ruc ?? '',
    });
    if (this.slots().xml.file !== file) return;
    this.xmlDocument.set(doc);
    const providerRuc = user?.roles.includes('Proveedor') ? user.providerId : undefined;
    if (doc.fromXml && providerRuc && doc.issuerRuc && doc.issuerRuc !== providerRuc) {
      this.patchSlot('xml', {
        error: `El XML fue emitido por el RUC ${doc.issuerRuc}. Solo puedes registrar documentos emitidos por tu RUC.`,
      });
    }
  }

  private fileError(file: File | undefined, accept: string[]): string {
    if (!file) return 'No recibimos ningún archivo.';
    if (!accept.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      return `El archivo debe ser ${accept.join(' o ')}. Recibimos «${file.name}».`;
    }
    if (file.size > MAX_SIZE) return 'El archivo supera los 5 MB permitidos.';
    return '';
  }

  private patchSlot(slot: Slot, patch: Partial<SlotState>): void {
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
    this.result.set(null);
  }
}
