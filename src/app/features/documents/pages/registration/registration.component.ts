import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../core/auth/auth.service';
import { NavigationService, Screen } from '../../../../core/navigation/navigation.service';
import { DocumentoService } from '../../services/documento.service';
import { MockUsersStore } from '../../../../shared/state/mock-users.store';
import { Documento, DocumentType, Role, SpecialSubtype } from '../../../../shared/models/models';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registration.component.html',
  styleUrls: ['../../../../app.scss', './registration.component.scss'],
})
export class RegistrationComponent {
  @Output() readonly navigateTo = new EventEmitter<Screen>();

  readonly auth = inject(AuthService);
  readonly navigation = inject(NavigationService);
  readonly screen = this.navigation.screen;
  readonly documentoService = inject(DocumentoService);
  readonly mockUsersStore = inject(MockUsersStore);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly message = signal('');
  readonly documents = this.documentoService.documents;
  readonly uploadedFiles = signal<{ name: string; kind: string; slot?: string }[]>([]);
  readonly supportFiles = computed(() => this.uploadedFiles().filter((file) => !file.slot));
  readonly xmlValidating = signal(false);
  readonly xmlValidationStage = signal(0);
  readonly xmlSummary = signal<{
    emisor: string;
    numero: string;
    fecha: string;
    moneda: string;
    importe: number;
    descripcion: string;
  } | null>(null);
  readonly registrationStep = signal<1 | 2 | 3 | 4 | 5>(1);
  readonly ocValidated = signal(false);
  readonly registrationResult = signal<Documento | null>(null);
  readonly requester = { area: '', username: '', email: '' };
  readonly requesterApproverSearch = signal('');
  readonly requesterApproverFocused = signal(false);
  readonly requesterAreas = computed(() =>
    Array.from(
      new Set(
        this.mockUsersStore
          .users()
          .filter((user) => user.area && !user.roles.includes('Proveedor'))
          .map((user) => user.area),
      ),
    ).sort(),
  );
  readonly requesterApprovers = computed(() =>
    this.mockUsersStore
      .users()
      .filter(
        (user) =>
          user.isActive && user.area === this.requester.area && !user.roles.includes('Proveedor'),
      )
      .sort((left, right) => left.companyName.localeCompare(right.companyName)),
  );
  readonly filteredRequesterApprovers = computed(() => {
    const term = this.requesterApproverSearch().trim().toLowerCase();
    return this.requesterApprovers().filter(
      (user) =>
        !term || `${user.companyName} ${user.username} ${user.email}`.toLowerCase().includes(term),
    );
  });

  readonly selectedSpecial = signal<SpecialSubtype | ''>('');
  readonly documentTypes: DocumentType[] = [
    'Con Orden de Compra',
    'Sin Orden de Compra',
    'Documento especial',
  ];
  readonly providerDocumentTypes: DocumentType[] = ['Con Orden de Compra', 'Sin Orden de Compra'];
  readonly specialTypes: SpecialSubtype[] = [
    'Boleto aéreo',
    'Recibo público',
    'No domiciliado',
    'Liquidación de cobranza',
  ];
  private demoSequence = 205;
  private xmlValidationRun = 0;
  readonly form = {
    numero: 'F001-000205',
    proveedor: 'Proveedor Andino SAC',
    providerId: '20123456789',
    sociedad: 'Naviera Transoceánica S.A.',
    tipo: 'Con Orden de Compra' as DocumentType,
    oc: 'OC-45000128',
    importe: 1850,
    fecha: '2026-05-21',
    aprobador: 'María Torres',
    validateSunat: true,
    details: {
      vuelo: 'LA2451',
      pasajero: 'Juan Sebastián',
      servicio: 'Energía eléctrica',
      suministro: 'SUM-004589',
      concepto: 'Servicio profesional especializado',
    },
  };
  constructor() {
    const currentUser = this.auth.user();
    if (currentUser?.role === 'Proveedor') {
      this.form.providerId = currentUser.providerId || '';
      this.form.proveedor = currentUser.name;
    }
    if (currentUser?.role === 'Colaborador interno') {
      this.form.tipo = 'Documento especial';
      this.form.oc = '';
      this.selectedSpecial.set('');
    }
  }

  addFiles(event: Event, expectedKind?: 'PDF' | 'XML' | 'CDR'): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []).map((file) => {
      const fileName = file.name.toLowerCase();
      const extension = file.name.split('.').pop()?.toUpperCase() || 'PDF';
      const isCdr = extension === 'XML' && /cdr|constancia|acuse/.test(fileName);
      return {
        name: file.name,
        kind: expectedKind || (isCdr ? 'CDR' : extension),
        slot: expectedKind,
      };
    });
    this.uploadedFiles.update((current) => [
      ...current.filter((file) => !expectedKind || file.slot !== expectedKind),
      ...files,
    ]);
    if (expectedKind === 'XML') {
      this.xmlSummary.set(null);
      this.startXmlValidation();
      input.value = '';
      return;
    }
    input.value = '';
  }
  validateXml(): void {
    const xmlFile = this.uploadedFiles().find((file) => file.kind === 'XML');
    if (!xmlFile) {
      this.xmlValidating.set(false);
      this.xmlValidationStage.set(0);
      this.showAlert('warning', 'Selecciona el XML del comprobante para validarlo.');
      return;
    }
    const documentNumber = xmlFile.name.match(/[A-Z]\d{3}-\d{6}/i)?.[0];
    if (documentNumber) this.form.numero = documentNumber.toUpperCase();
    this.xmlSummary.set({
      emisor: this.form.proveedor || 'Proveedor Andino SAC',
      numero: this.form.numero,
      fecha: this.form.fecha,
      moneda: 'PEN',
      importe: this.form.importe,
      descripcion: this.form.details.concepto || 'Servicio registrado en el comprobante XML',
    });
    this.xmlValidating.set(false);
    this.xmlValidationStage.set(4);
    this.showAlert('success', 'XML validado correctamente. Ahora adjunta los archivos requeridos.');
  }
  startXmlValidation(): void {
    const validationRun = ++this.xmlValidationRun;
    this.xmlValidating.set(true);
    this.xmlValidationStage.set(1);
    setTimeout(() => {
      if (validationRun === this.xmlValidationRun) this.xmlValidationStage.set(2);
    }, 800);
    setTimeout(() => {
      if (validationRun === this.xmlValidationRun) this.xmlValidationStage.set(3);
    }, 1600);
    setTimeout(() => {
      if (validationRun === this.xmlValidationRun) this.validateXml();
    }, 2400);
  }
  hasUploadedFile(kind: string): boolean {
    return this.uploadedFiles().some((file) => file.kind === kind);
  }
  uploadedFileName(kind: string): string {
    return this.uploadedFiles().find((file) => file.kind === kind)?.name || '';
  }
  supportFilesLabel(): string {
    const count = this.supportFiles().length;
    return count === 1 ? this.supportFiles()[0].name : count + ' documentos cargados';
  }
  loadXmlScenario(prefix: 'E' | 'F'): void {
    const sequence = ++this.demoSequence;
    const documentNumber = prefix + '001-' + String(sequence).padStart(6, '0');
    this.form.numero = documentNumber;
    this.uploadedFiles.update((files) => [
      ...files.filter((file) => file.slot !== 'XML'),
      { name: documentNumber + '.xml', kind: 'XML', slot: 'XML' },
    ]);
    this.xmlSummary.set(null);
    this.startXmlValidation();
  }
  removeFile(name: string): void {
    const removedXml = this.uploadedFiles().some(
      (file) => file.name === name && file.kind === 'XML',
    );
    this.uploadedFiles.update((files) => files.filter((file) => file.name !== name));
    if (removedXml) {
      this.xmlSummary.set(null);
      this.xmlValidating.set(false);
      this.xmlValidationRun += 1;
      this.xmlValidationStage.set(0);
    }
  }
  isSunatDocument(): boolean {
    return this.form.numero.trim().toUpperCase().startsWith('E');
  }

  loadOcScenario(valid: boolean): void {
    this.form.oc = valid ? 'OC-45000128' : 'OC-FAIL-0001';
    this.ocValidated.set(false);
  }

  setType(type: DocumentType): void {
    this.form.tipo = type;
    this.ocValidated.set(false);
    if (type !== 'Documento especial') this.selectedSpecial.set('');
    if (type === 'Con Orden de Compra') this.form.validateSunat = true;
  }
  setRequesterArea(area: string): void {
    this.requester.area = area;
    this.requester.username = '';
    this.requester.email = '';
    this.requesterApproverSearch.set('');
    this.requesterApproverFocused.set(false);
  }
  setRequesterApproverSearch(value: string): void {
    this.requesterApproverSearch.set(value);
    const selected = this.requesterApprovers().find(
      (user) => user.companyName === value && user.username === this.requester.username,
    );
    if (!selected) {
      this.requester.username = '';
      this.requester.email = '';
    }
  }
  selectRequesterApprover(username: string): void {
    this.requester.username = username;
    const approver = this.requesterApprovers().find((user) => user.username === username);
    this.requester.email = approver?.email || '';
    this.requesterApproverSearch.set(approver?.companyName || '');
    this.requesterApproverFocused.set(false);
  }
  closeRequesterApproverSearch(): void {
    setTimeout(() => this.requesterApproverFocused.set(false), 120);
  }
  requiredFilesText(): string {
    if (this.isRole('Colaborador interno')) return 'PDF obligatorio';
    return this.isSunatDocument() ? 'PDF + XML + sustentos' : 'PDF + XML + CDR + sustentos';
  }
  nextRegistrationStep(): void {
    this.error.set('');
    if (isRoleInternal(this.auth.user()?.role) && (!this.form.numero || !this.form.importe)) {
      this.showAlert('warning', 'Completa el número de documento y el importe total.');
      return;
    }
    if (this.form.tipo === 'Documento especial' && !this.selectedSpecial()) {
      this.showAlert('warning', 'Selecciona el subtipo del documento especial.');
      return;
    }
    if (this.registrationStep() === 1 && this.form.tipo === 'Con Orden de Compra') {
      if (!this.form.oc) {
        this.showAlert('warning', 'Ingresa el número de orden de compra.');
        return;
      }
      this.loading.set(true);
      setTimeout(() => {
        this.loading.set(false);
        if (this.form.oc.toUpperCase().includes('FAIL')) {
          this.showAlert('error', 'La orden de compra no está aprobada en SAP.');
          this.ocValidated.set(false);
          return;
        }
        this.ocValidated.set(true);
        this.showAlert('success', `OC ${this.form.oc} validada correctamente en SAP.`);
        this.registrationStep.set(isRoleInternal(this.auth.user()?.role) ? 3 : 2);
      }, 900);
      return;
    }
    if (this.registrationStep() === 1) {
      this.registrationStep.set(isRoleInternal(this.auth.user()?.role) ? 3 : 2);
      return;
    }
    if (this.registrationStep() === 2) {
      if (this.isRole('Proveedor') && !this.xmlSummary()) {
        this.showAlert('warning', 'Valida primero el XML del comprobante para continuar.');
        return;
      }
      this.registrationStep.set(3);
      return;
    }
    if (this.registrationStep() === 3) {
      if (!this.validateUploadedFiles()) return;
      this.registrationStep.set(4);
    }
  }
  previousRegistrationStep(): void {
    if (this.registrationStep() === 1) return;
    this.registrationStep.update((step) => {
      if (step === 5) return 4;
      if (step === 4) return 3;
      if (step === 3) return this.isRole('Proveedor') ? 2 : 1;
      return 1;
    });
  }
  validateUploadedFiles(): boolean {
    const fileKinds = this.uploadedFiles().map((file) => file.kind);
    const hasPdf = fileKinds.includes('PDF');
    const hasXml = fileKinds.includes('XML');
    const hasCdr = fileKinds.includes('CDR');
    const requiresCdr = this.isRole('Proveedor') && !this.isSunatDocument();
    const missingProviderFiles =
      this.isRole('Proveedor') && (!hasPdf || !hasXml || (requiresCdr && !hasCdr));
    if (
      !this.form.numero ||
      !this.form.importe ||
      !this.uploadedFiles().length ||
      missingProviderFiles ||
      (this.form.tipo === 'Con Orden de Compra' && !this.form.oc) ||
      (this.form.tipo === 'Documento especial' && !this.selectedSpecial()) ||
      (this.isRole('Proveedor') &&
        this.form.tipo === 'Sin Orden de Compra' &&
        (!this.requester.area || !this.requester.email))
    ) {
      this.error.set(
        this.isRole('Proveedor')
          ? `Adjunta los archivos requeridos: ${this.requiredFilesText()}.`
          : 'Completa los campos obligatorios y adjunta el PDF para continuar.',
      );
      this.showAlert('warning', this.error());
      return false;
    }
    return true;
  }
  submitDocument(): void {
    this.error.set('');
    this.message.set('');
    if (this.isRole('Proveedor') && !this.xmlSummary()) {
      this.showAlert('warning', 'Valida primero el XML del comprobante para continuar.');
      return;
    }
    if (!this.validateUploadedFiles()) return;
    this.loading.set(true);
    const dto = {
      ...this.form,
      subtipo: this.selectedSpecial() || undefined,
      details: {
        ...this.form.details,
        areaSolicitante: this.requester.area,
        usuarioAprobador: this.requester.username,
        correoSolicitante: this.requester.email,
        archivos: this.uploadedFiles()
          .map((file) => file.name)
          .join(', '),
      },
    };
    this.documentoService.registrarDocumento(dto).subscribe({
      next: (item) => {
        this.loading.set(false);
        this.registrationResult.set(item);
        this.registrationStep.set(5);
        this.showToast(`El documento ${item.numero} fue recibido correctamente.`);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message);
        this.showAlert('error', err.message);
      },
    });
  }
  private showAlert(icon: 'success' | 'error' | 'warning' | 'info', text: string): void {
    const titles = {
      success: 'Operación completada',
      error: 'No fue posible completar la acción',
      warning: 'Revisa la información',
      info: 'Información',
    };
    this.showStatusToast(icon, titles[icon], text);
  }
  private showToast(text: string): void {
    this.showStatusToast('success', 'Documento recibido', text);
  }
  private showStatusToast(
    icon: 'success' | 'error' | 'warning' | 'info',
    title: string,
    text: string,
  ): void {
    const icons = {
      success: 'bx-check',
      error: 'bx-error',
      warning: 'bx-error',
      info: 'bx-info-circle',
    };
    void Swal.fire({
      toast: true,
      position: 'top-end',
      iconHtml: `<i class="bx ${icons[icon]} status-toast-check"></i>`,
      title,
      text,
      showCloseButton: true,
      showConfirmButton: false,
      timer: 10000,
      timerProgressBar: true,
      customClass: {
        popup: `status-toast status-toast-${icon}`,
        icon: 'status-toast-icon',
        title: 'status-toast-title',
        htmlContainer: 'status-toast-text',
      },
    });
  }
  resetForm(): void {
    this.demoSequence += 1;
    this.form.numero = `F001-${String(this.demoSequence).padStart(6, '0')}`;
    this.form.oc = `OC-45000${this.demoSequence}`;
    this.form.importe = 1850;
    this.form.fecha = '2026-05-21';
    this.form.tipo = 'Con Orden de Compra';
    this.form.validateSunat = true;
    this.selectedSpecial.set('');
    this.uploadedFiles.set([]);
    this.xmlSummary.set(null);
    this.xmlValidating.set(false);
    this.xmlValidationRun += 1;
    this.xmlValidationStage.set(0);
    this.registrationStep.set(1);
    this.ocValidated.set(false);
    this.registrationResult.set(null);
    this.requester.area = '';
    this.requester.username = '';
    this.requester.email = '';
    this.requesterApproverSearch.set('');
    this.requesterApproverFocused.set(false);
    this.form.details = {
      vuelo: 'LA2451',
      pasajero: 'Juan Sebastián',
      servicio: 'Energía eléctrica',
      suministro: 'SUM-004589',
      concepto: 'Servicio profesional especializado',
    };
  }

  isRole(role: Role): boolean {
    return this.auth.user()?.role === role;
  }
  navigate(screen: Screen): void {
    this.navigateTo.emit(screen);
  }
}

function isRoleInternal(role: Role | undefined): boolean {
  return role === 'Colaborador interno';
}
