import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AprobacionService } from './aprobacion.service';
import { AuthService } from './auth.service';
import { ContabilizacionService } from './contabilizacion.service';
import { DocumentoService } from './documento.service';
import { AdminService, AdminUser } from './admin.service';
import { AdminUsersComponent } from './admin-users.component';
import { MockUsersStore } from './mock-users.store';
import { SapProviderService } from './sap-provider.service';
import { ApprovalLevel, ApprovalWorkflow, WorkflowService } from './workflow.service';
import { environment } from '../environments/environment';
import { Documento, DocumentType, Role, SpecialSubtype } from './models';

type Screen =
  | 'dashboard'
  | 'registrar'
  | 'documentos'
  | 'consultas'
  | 'perfil'
  | 'usuarios'
  | 'workflows'
  | 'aprobaciones'
  | 'contabilizacion';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, AdminUsersComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss', './theme.scss', './readability.scss'],
})
export class App {
  readonly Math = Math;
  readonly auth = inject(AuthService);
  readonly documentoService = inject(DocumentoService);
  readonly aprobacionService = inject(AprobacionService);
  readonly contabilizacionService = inject(ContabilizacionService);
  readonly adminService = inject(AdminService);
  readonly mockUsersStore = inject(MockUsersStore);
  readonly sapProviderService = inject(SapProviderService);
  readonly workflowService = inject(WorkflowService);
  readonly screen = signal<Screen>('dashboard');
  readonly menuOpen = signal(false);
  readonly loading = signal(false);
  readonly message = signal('');
  readonly error = signal('');
  readonly expandedId = signal<number | null>(null);
  readonly documents = this.documentoService.documents;
  readonly approvalItems = signal(
    this.documents().filter((item) => item.status === 'Pendiente de aprobación'),
  );
  readonly accountingItems = signal(
    this.documents().filter((item) => item.status === 'Pendiente de contabilización'),
  );
  readonly accountingQuery = signal('');
  readonly accountingPage = signal(1);
  readonly accountingPageSize = signal(5);
  readonly filteredAccountingItems = computed(() => {
    const term = this.accountingQuery().trim().toLowerCase();
    return this.accountingItems().filter((item) =>
      `${item.numero} ${item.proveedor} ${item.sociedad} ${item.contabilizacion?.numero || ''}`
        .toLowerCase()
        .includes(term),
    );
  });
  readonly accountingPageCount = computed(() =>
    Math.max(1, Math.ceil(this.filteredAccountingItems().length / this.accountingPageSize())),
  );
  readonly accountingItemsPage = computed(() => {
    const start = (this.accountingPage() - 1) * this.accountingPageSize();
    return this.filteredAccountingItems().slice(start, start + this.accountingPageSize());
  });
  readonly accountingPaginationPages = computed(() =>
    Array.from({ length: this.accountingPageCount() }, (_, index) => index + 1),
  );
  readonly username = signal(environment.defaultLoginUsername);
  readonly password = signal(environment.defaultLoginPassword);
  readonly filterStatus = signal('');
  readonly filterType = signal('');
  readonly documentQuery = signal('');
  readonly documentPage = signal(1);
  readonly documentPageSize = signal(5);
  readonly approvalComment = signal<Record<number, string>>({});
  readonly approvalTarget = signal<Record<number, string>>({});
  readonly accountingRoute = signal<Record<number, 'SAP' | 'Sertica'>>({});
  readonly showPassword = signal(false);
  readonly showRegistrationPassword = signal(false);
  readonly showRegistrationConfirmPassword = signal(false);
  readonly showRegistration = signal(false);
  readonly registrationLoading = signal(false);
  readonly registrationSapLoading = signal(false);
  readonly registrationMessage = signal('');
  readonly registrationCompleted = signal(false);
  readonly registrationValidated = signal(false);
  readonly registrationTermsAccepted = signal(false);
  readonly registrationKeyRequested = signal(false);
  readonly registration = { ruc: '', email: '', company: '' };
  readonly uploadedFiles = signal<{ name: string; kind: string; slot?: string }[]>([]);
  readonly xmlSummary = signal<{
    emisor: string;
    numero: string;
    fecha: string;
    moneda: string;
    importe: number;
    descripcion: string;
  } | null>(null);
  readonly registrationStep = signal<1 | 2 | 3>(1);
  readonly ocValidated = signal(false);
  readonly registrationResult = signal<Documento | null>(null);
  readonly requester = { area: 'Operaciones', email: 'solicitante@naviera.com' };
  readonly query = signal('');
  readonly adminUsers = signal<AdminUser[]>([]);
  readonly allAdminUsers = signal<AdminUser[]>([]);
  readonly adminUserMessage = signal('');
  readonly adminUserError = signal('');
  readonly adminUserLoading = signal(false);
  readonly workflowSearch = signal('');
  readonly workflowPage = signal(1);
  readonly workflowPageSize = signal(5);
  readonly showWorkflowForm = signal(false);
  readonly editingWorkflow = signal<ApprovalWorkflow | null>(null);
  readonly workflowError = signal('');
  readonly workflowForm = {
    name: '',
    description: '',
    society: 'Todas las sociedades',
    documentType: 'Sin Orden de Compra',
    approvalLevels: [{ approvers: ['Área Usuaria'], rule: 'any' }] as ApprovalLevel[],
  };
  readonly workflowSocieties = [
    'Todas las sociedades',
    'Naviera Transoceánica S.A.',
    'Naviera Transoceánica Perú S.A.',
    'Ultratag S.A.',
    'Petral S.A.',
    'RENADSA S.A.',
  ];
  readonly workflowDocumentTypes = [
    'Con Orden de Compra',
    'Sin Orden de Compra',
    'Documento especial',
  ];
  readonly workflowApprovers = computed(() => [
    'Área Usuaria',
    'Jefatura de Área',
    ...this.mockUsersStore
      .users()
      .filter((user) => user.roles.some((role) => role !== 'Proveedor'))
      .map((user) => user.companyName),
  ]);
  readonly workflowApproverSearches: string[] = [];
  readonly filteredWorkflows = computed(() => {
    const term = this.workflowSearch().trim().toLowerCase();
    return this.workflowService
      .workflows()
      .filter(
        (item) =>
          !term ||
          `${item.name} ${item.description} ${item.documentType}`.toLowerCase().includes(term),
      );
  });
  readonly workflowPageCount = computed(() =>
    Math.max(1, Math.ceil(this.filteredWorkflows().length / this.workflowPageSize())),
  );
  readonly workflowsPage = computed(() => {
    const start = (this.workflowPage() - 1) * this.workflowPageSize();
    return this.filteredWorkflows().slice(start, start + this.workflowPageSize());
  });
  readonly workflowPaginationPages = computed(() =>
    Array.from({ length: this.workflowPageCount() }, (_, index) => index + 1),
  );
  readonly adminUserSearch = signal('');
  readonly adminUserPage = signal(1);
  readonly adminUserPageSize = signal(10);
  readonly showAdminUserForm = signal(false);
  readonly adminRole = signal('Área Usuaria');
  readonly newAdminUser = { username: '', email: '', companyName: '', ruc: '', password: '' };
  readonly adminRoles = ['Proveedor', 'Área Usuaria', 'CxP', 'Administrador'];
  readonly filteredAdminUsers = computed(() => {
    const term = this.adminUserSearch().trim().toLowerCase();
    return this.allAdminUsers().filter(
      (user) =>
        !term ||
        `${user.companyName} ${user.email} ${user.ruc} ${user.roles.join(' ')}`
          .toLowerCase()
          .includes(term),
    );
  });
  readonly adminPageCount = computed(() =>
    Math.max(1, Math.ceil(this.filteredAdminUsers().length / this.adminUserPageSize())),
  );
  readonly adminUsersPage = computed(() => {
    const start = (this.adminUserPage() - 1) * this.adminUserPageSize();
    return this.filteredAdminUsers().slice(start, start + this.adminUserPageSize());
  });
  readonly adminPaginationPages = computed(() =>
    Array.from({ length: this.adminPageCount() }, (_, index) => index + 1),
  );
  readonly userMenuOpen = signal(false);
  readonly accountingSociety = signal('');
  readonly accountingType = signal('');
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
  readonly providerDocuments = computed(() =>
    this.documents().filter(
      (item) =>
        this.auth.user()?.role !== 'Proveedor' || item.providerId === this.auth.user()?.providerId,
    ),
  );
  readonly filteredDocuments = computed(() =>
    this.providerDocuments().filter((item) => {
      const term = this.documentQuery().trim().toLowerCase();
      const content = `${item.numero} ${item.oc || ''} ${item.sociedad} ${item.tipo} ${item.status}`;
      return (
        (!term || content.toLowerCase().includes(term)) &&
        (!this.filterStatus() || item.status === this.filterStatus()) &&
        (!this.filterType() || item.tipo === this.filterType())
      );
    }),
  );
  readonly documentPageCount = computed(() =>
    Math.max(1, Math.ceil(this.filteredDocuments().length / this.documentPageSize())),
  );
  readonly documentsPage = computed(() => {
    const start = (this.documentPage() - 1) * this.documentPageSize();
    return this.filteredDocuments().slice(start, start + this.documentPageSize());
  });
  readonly documentPaginationPages = computed(() =>
    Array.from({ length: this.documentPageCount() }, (_, index) => index + 1),
  );
  readonly pendingCount = computed(
    () =>
      this.providerDocuments().filter((item) =>
        ['Pendiente de aprobación', 'Pendiente de contabilización'].includes(item.status),
      ).length,
  );
  readonly approvedCount = computed(
    () =>
      this.providerDocuments().filter((item) =>
        ['Aprobado', 'Pendiente de contabilización', 'Contabilizado'].includes(item.status),
      ).length,
  );
  readonly rejectedCount = computed(
    () =>
      this.providerDocuments().filter((item) =>
        ['Rechazado', 'Devuelto al proveedor'].includes(item.status),
      ).length,
  );

  login(): void {
    this.error.set('');
    this.loading.set(true);
    this.auth.login(this.username(), this.password()).subscribe({
      next: () => {
        this.loading.set(false);
        const currentUser = this.auth.user();
        if (currentUser?.role === 'Proveedor') {
          this.form.providerId = currentUser.providerId || '';
          this.form.proveedor = currentUser.name;
        }
        if (this.auth.user()?.role === 'Colaborador interno') {
          this.form.tipo = 'Documento especial';
          this.form.oc = '';
          this.selectedSpecial.set('');
        }
        this.screen.set(this.landingScreen());
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message);
      },
    });
  }
  quickLogin(username: string): void {
    this.username.set(username);
    this.password.set('1234');
    this.login();
  }
  openRegistration(): void {
    this.registrationMessage.set('');
    this.registrationCompleted.set(false);
    this.registrationValidated.set(false);
    this.registrationTermsAccepted.set(false);
    this.registrationKeyRequested.set(false);
    this.registration.ruc = '';
    this.registration.company = '';
    this.registration.email = '';
    this.showRegistration.set(true);
  }
  closeRegistration(): void {
    this.showRegistration.set(false);
    this.registrationMessage.set('');
    this.registrationCompleted.set(false);
    this.registrationValidated.set(false);
    this.registrationKeyRequested.set(false);
  }
  finishRegistration(): void {
    this.username.set(this.registration.ruc);
    this.password.set('');
    this.showRegistration.set(false);
    this.registrationCompleted.set(false);
    this.registrationKeyRequested.set(false);
  }
  register(): void {
    if (!this.registrationValidated()) {
      this.registrationMessage.set('Primero valida el RUC para continuar.');
      return;
    }
    if (!this.registrationTermsAccepted()) {
      this.registrationMessage.set('Debes aceptar los términos y condiciones.');
      return;
    }
    this.registrationLoading.set(true);
    this.registrationMessage.set('');
    this.sapProviderService
      .requestAccessKey({
        ruc: this.registration.ruc,
        companyName: this.registration.company,
        email: this.registration.email,
      })
      .subscribe({
        next: () => {
          this.registrationLoading.set(false);
          this.registrationKeyRequested.set(true);
        },
        error: (err) => {
          this.registrationLoading.set(false);
          this.registrationMessage.set(
            err.error?.message || 'No fue posible completar el registro.',
          );
        },
      });
  }
  validateRegistrationRuc(): void {
    this.registrationMessage.set('');
    this.registrationValidated.set(false);
    this.registration.ruc = this.registration.ruc.replace(/\D/g, '');
    if (!this.registration.ruc) {
      this.registrationMessage.set('Ingresa el RUC para continuar.');
      return;
    }
    if (this.registration.ruc.length !== 11) {
      this.registrationMessage.set('El RUC debe tener 11 dígitos.');
      return;
    }
    this.registrationSapLoading.set(true);
    this.sapProviderService.lookupByRuc(this.registration.ruc).subscribe({
      next: (provider) => {
        this.registration.company = provider.companyName;
        this.registration.email = provider.email;
        this.registrationValidated.set(true);
        this.registrationSapLoading.set(false);
      },
      error: (error) => {
        this.registrationSapLoading.set(false);
        this.registrationMessage.set(
          error.message || 'No encontramos información para el RUC indicado.',
        );
      },
    });
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
    const xmlFile = files.find((file) => file.kind === 'XML');
    if (xmlFile) {
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
    }
    input.value = '';
  }
  removeFile(name: string): void {
    this.uploadedFiles.update((files) => files.filter((file) => file.name !== name));
  }
  isSunatDocument(): boolean {
    return this.form.numero.trim().toUpperCase().startsWith('E');
  }
  toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
  }
  logout(): void {
    this.auth.logout();
    this.screen.set('dashboard');
    this.username.set(environment.defaultLoginUsername);
    this.password.set(environment.defaultLoginPassword);
    this.showPassword.set(false);
    this.userMenuOpen.set(false);
  }
  prepareScenario(scenario: 'oc' | 'sin-oc' | 'especial'): void {
    const sequence = ++this.demoSequence;
    this.form.numero =
      scenario === 'oc'
        ? `F001-${String(sequence).padStart(6, '0')}`
        : scenario === 'sin-oc'
          ? `B001-${String(sequence).padStart(6, '0')}`
          : `E001-${String(sequence).padStart(6, '0')}`;
    this.form.oc = scenario === 'oc' ? `OC-45000${sequence}` : '';
    this.form.importe = scenario === 'oc' ? 1850 : scenario === 'sin-oc' ? 640 : 920;
    this.form.tipo =
      scenario === 'oc'
        ? 'Con Orden de Compra'
        : scenario === 'sin-oc'
          ? 'Sin Orden de Compra'
          : 'Documento especial';
    this.form.validateSunat = true;
    this.selectedSpecial.set(scenario === 'especial' ? 'Boleto aéreo' : '');
    this.form.details = {
      vuelo: 'LA2451',
      pasajero: 'Juan Sebastián',
      servicio: 'Energía eléctrica',
      suministro: 'SUM-004589',
      concepto: 'Servicio profesional especializado',
    };
    this.navigate('registrar');
  }
  navigate(screen: Screen): void {
    this.error.set('');
    this.message.set('');
    this.screen.set(screen);
    if (screen === 'documentos') this.documentPage.set(1);
    if (screen === 'registrar') this.registrationStep.set(1);
    this.menuOpen.set(false);
    if (screen === 'aprobaciones') this.loadApprovals();
    if (screen === 'contabilizacion') this.loadAccounting();
    if (screen === 'usuarios') this.loadAdminUsers();
  }
  landingScreen(): Screen {
    const role = this.auth.user()?.role;
    if (role === 'Colaborador interno') return 'registrar';
    if (role === 'Área Usuaria') return 'aprobaciones';
    if (role === 'CxP') return 'contabilizacion';
    return 'dashboard';
  }
  loadAdminUsers(): void {
    this.adminUserLoading.set(true);
    this.adminService.list().subscribe({
      next: (users) => {
        this.allAdminUsers.set(users);
        this.adminUserPage.set(1);
        this.refreshAdminUsersPage();
        this.adminUserLoading.set(false);
      },
      error: (err) => {
        this.adminUserLoading.set(false);
        this.adminUserError.set(err.error?.message || 'No fue posible cargar los usuarios.');
      },
    });
  }
  setAdminUserSearch(value: string): void {
    this.adminUserSearch.set(value);
    this.adminUserPage.set(1);
    this.refreshAdminUsersPage();
  }
  setAdminUserPage(page: number): void {
    this.adminUserPage.set(Math.min(Math.max(page, 1), this.adminPageCount()));
    this.refreshAdminUsersPage();
  }
  setAdminUserPageSize(size: number | string): void {
    this.adminUserPageSize.set(Number(size));
    this.adminUserPage.set(1);
    this.refreshAdminUsersPage();
  }
  private refreshAdminUsersPage(): void {
    const start = (this.adminUserPage() - 1) * this.adminUserPageSize();
    this.adminUsers.set(this.filteredAdminUsers().slice(start, start + this.adminUserPageSize()));
  }
  openAdminUserForm(): void {
    this.adminUserMessage.set('');
    this.adminUserError.set('');
    this.showAdminUserForm.set(true);
  }
  closeAdminUserForm(): void {
    this.showAdminUserForm.set(false);
    this.adminUserError.set('');
  }
  createAdminUser(): void {
    this.adminUserMessage.set('');
    this.adminUserError.set('');
    if (
      !this.newAdminUser.username ||
      !this.newAdminUser.email ||
      !this.newAdminUser.companyName ||
      !this.newAdminUser.ruc ||
      !this.newAdminUser.password
    ) {
      this.adminUserError.set('Completa todos los campos para crear el usuario.');
      return;
    }
    this.adminUserLoading.set(true);
    this.adminService
      .create({ ...this.newAdminUser, roles: [this.adminRole() as Role] })
      .subscribe({
        next: () => {
          this.adminUserLoading.set(false);
          this.adminUserMessage.set('Usuario creado correctamente.');
          this.newAdminUser.username = '';
          this.newAdminUser.email = '';
          this.newAdminUser.companyName = '';
          this.newAdminUser.ruc = '';
          this.newAdminUser.password = '';
          this.showAdminUserForm.set(false);
          this.loadAdminUsers();
        },
        error: (err) => {
          this.adminUserLoading.set(false);
          this.adminUserError.set(err.error?.message || 'No fue posible crear el usuario.');
        },
      });
  }
  changeAdminRole(user: AdminUser, role: string): void {
    this.adminService.assignRole(user.id, role).subscribe({
      next: (updated) => {
        this.allAdminUsers.update((users) =>
          users.map((item) => (item.id === updated.id ? updated : item)),
        );
        this.refreshAdminUsersPage();
      },
      error: (err) =>
        this.adminUserError.set(err.error?.message || 'No fue posible actualizar el rol.'),
    });
  }
  toggleAdminStatus(user: AdminUser): void {
    this.adminService.setStatus(user.id, !user.isActive).subscribe({
      next: (updated) => {
        this.allAdminUsers.update((users) =>
          users.map((item) => (item.id === updated.id ? updated : item)),
        );
        this.refreshAdminUsersPage();
      },
      error: (err) =>
        this.adminUserError.set(err.error?.message || 'No fue posible actualizar el estado.'),
    });
  }
  isRole(role: Role): boolean {
    return this.auth.user()?.role === role;
  }
  setActiveRole(role: Role): void {
    this.auth.setActiveRole(role);
    this.screen.set(this.landingScreen());
  }
  loadApprovals(): void {
    this.loading.set(true);
    this.aprobacionService.pendientes().subscribe((items) => {
      this.approvalItems.set(items);
      this.loading.set(false);
    });
  }
  loadAccounting(): void {
    this.loading.set(true);
    this.contabilizacionService.ejecutarJobDiario().subscribe(() =>
      this.contabilizacionService
        .contabilizados(this.accountingSociety(), this.accountingType())
        .subscribe((items) => {
          this.accountingItems.set(items);
          this.accountingPage.set(1);
          this.loading.set(false);
        }),
    );
  }
  toggle(id: number): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }
  setDocumentQuery(value: string): void {
    this.documentQuery.set(value);
    this.documentPage.set(1);
  }
  setDocumentType(value: string): void {
    this.filterType.set(value);
    this.documentPage.set(1);
  }
  setDocumentStatus(value: string): void {
    this.filterStatus.set(value);
    this.documentPage.set(1);
  }
  setDocumentPageSize(value: string): void {
    this.documentPageSize.set(Number(value));
    this.documentPage.set(1);
  }
  setDocumentPage(page: number): void {
    this.documentPage.set(page);
  }
  setType(type: DocumentType): void {
    this.form.tipo = type;
    this.ocValidated.set(false);
    if (type !== 'Documento especial') this.selectedSpecial.set('');
    if (type === 'Con Orden de Compra') this.form.validateSunat = true;
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
        this.registrationStep.set(2);
      }, 900);
      return;
    }
    this.registrationStep.set(2);
  }
  previousRegistrationStep(): void {
    if (this.registrationStep() === 1) return;
    this.registrationStep.update((step) => (step === 3 ? 2 : 1) as 1 | 2 | 3);
  }
  submitDocument(): void {
    this.error.set('');
    this.message.set('');
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
      (this.form.tipo !== 'Con Orden de Compra' && (!this.requester.area || !this.requester.email))
    ) {
      this.error.set(
        this.isRole('Proveedor')
          ? `Adjunta los archivos requeridos: ${this.requiredFilesText()}.`
          : 'Completa los campos obligatorios y adjunta el PDF para continuar.',
      );
      this.showAlert('warning', this.error());
      return;
    }
    this.loading.set(true);
    const dto = {
      ...this.form,
      subtipo: this.selectedSpecial() || undefined,
      details: {
        ...this.form.details,
        areaSolicitante: this.requester.area,
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
        this.registrationStep.set(3);
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
    this.registrationStep.set(1);
    this.ocValidated.set(false);
    this.registrationResult.set(null);
    this.form.details = {
      vuelo: 'LA2451',
      pasajero: 'Juan Sebastián',
      servicio: 'Energía eléctrica',
      suministro: 'SUM-004589',
      concepto: 'Servicio profesional especializado',
    };
  }
  approve(id: number): void {
    this.loading.set(true);
    this.aprobacionService.aprobar(id).subscribe((item) => {
      this.loading.set(false);
      this.message.set(`Documento ${item.numero} aprobado y enviado a contabilización.`);
      this.loadApprovals();
    });
  }
  reject(id: number): void {
    const comment = this.approvalComment()[id]?.trim();
    if (!comment) {
      this.error.set('El comentario es obligatorio para rechazar.');
      return;
    }
    this.loading.set(true);
    this.aprobacionService.rechazar(id, comment).subscribe((item) => {
      this.loading.set(false);
      this.message.set(`Documento ${item.numero} rechazado.`);
      this.loadApprovals();
    });
  }
  derive(id: number): void {
    const target = this.approvalTarget()[id]?.trim();
    if (!target) {
      this.error.set('Selecciona el aprobador al que se derivará el documento.');
      return;
    }
    this.loading.set(true);
    this.aprobacionService.derivar(id, target).subscribe((item) => {
      this.loading.set(false);
      this.message.set(`Documento ${item.numero} derivado a ${target}.`);
      this.loadApprovals();
    });
  }
  resendAttachments(id: number): void {
    this.loading.set(true);
    this.contabilizacionService.reenviarAnexos(id).subscribe((item) => {
      this.loading.set(false);
      this.showToast(`Los anexos de ${item.numero} fueron reenviados a SAP.`);
    });
  }
  setAccountingQuery(value: string): void {
    this.accountingQuery.set(value);
    this.accountingPage.set(1);
  }
  setAccountingPageSize(value: string): void {
    this.accountingPageSize.set(Number(value));
    this.accountingPage.set(1);
  }
  setAccountingPage(page: number): void {
    this.accountingPage.set(page);
  }
  attachmentNames(item: Documento): string[] {
    return (item.details['archivos'] || '')
      .split(',')
      .map((file) => file.trim())
      .filter(Boolean);
  }
  setComment(id: number, value: string): void {
    this.approvalComment.update((values) => ({ ...values, [id]: value }));
  }
  setApprovalTarget(id: number, value: string): void {
    this.approvalTarget.update((values) => ({ ...values, [id]: value }));
  }
  openWorkflowForm(workflow?: ApprovalWorkflow): void {
    this.workflowError.set('');
    this.editingWorkflow.set(workflow || null);
    this.workflowForm.name = workflow?.name || '';
    this.workflowForm.description = workflow?.description || '';
    this.workflowForm.society = workflow?.society || 'Todas las sociedades';
    this.workflowForm.documentType = workflow?.documentType || 'Sin Orden de Compra';
    this.workflowForm.approvalLevels = workflow?.approvalLevels.length
      ? workflow.approvalLevels.map((level) => ({ ...level, approvers: [...level.approvers] }))
      : [{ approvers: ['Área Usuaria'], rule: 'any' }];
    this.workflowApproverSearches.length = this.workflowForm.approvalLevels.length;
    this.workflowApproverSearches.fill('');
    this.showWorkflowForm.set(true);
  }
  setWorkflowSearch(value: string): void {
    this.workflowSearch.set(value);
    this.workflowPage.set(1);
  }
  setWorkflowPageSize(value: string): void {
    this.workflowPageSize.set(Number(value));
    this.workflowPage.set(1);
  }
  setWorkflowPage(page: number): void {
    this.workflowPage.set(Math.min(Math.max(page, 1), this.workflowPageCount()));
  }
  closeWorkflowForm(): void {
    this.showWorkflowForm.set(false);
    this.editingWorkflow.set(null);
    this.workflowError.set('');
  }
  toggleWorkflowApprover(levelIndex: number, approver: string): void {
    const level = this.workflowForm.approvalLevels[levelIndex];
    level.approvers = level.approvers.includes(approver)
      ? level.approvers.filter((item) => item !== approver)
      : [...level.approvers, approver];
  }
  removeWorkflowApprover(levelIndex: number, approver: string): void {
    this.workflowForm.approvalLevels[levelIndex].approvers = this.workflowForm.approvalLevels[
      levelIndex
    ].approvers.filter((item) => item !== approver);
  }
  setWorkflowApproverSearch(levelIndex: number, value: string): void {
    this.workflowApproverSearches[levelIndex] = value;
  }
  filteredWorkflowApprovers(levelIndex: number): string[] {
    const level = this.workflowForm.approvalLevels[levelIndex];
    const term = (this.workflowApproverSearches[levelIndex] || '').trim().toLowerCase();
    if (!term) return [];
    return this.workflowApprovers().filter(
      (approver) => !level.approvers.includes(approver) && approver.toLowerCase().includes(term),
    );
  }
  addWorkflowLevel(): void {
    this.workflowForm.approvalLevels = [
      ...this.workflowForm.approvalLevels,
      { approvers: [], rule: 'any' },
    ];
    this.workflowApproverSearches.push('');
  }
  removeWorkflowLevel(levelIndex: number): void {
    this.workflowForm.approvalLevels = this.workflowForm.approvalLevels.filter(
      (_, index) => index !== levelIndex,
    );
    this.workflowApproverSearches.splice(levelIndex, 1);
  }
  moveWorkflowLevel(levelIndex: number, direction: -1 | 1): void {
    const targetIndex = levelIndex + direction;
    if (targetIndex < 0 || targetIndex >= this.workflowForm.approvalLevels.length) return;
    const levels = [...this.workflowForm.approvalLevels];
    [levels[levelIndex], levels[targetIndex]] = [levels[targetIndex], levels[levelIndex]];
    this.workflowForm.approvalLevels = levels;
    [this.workflowApproverSearches[levelIndex], this.workflowApproverSearches[targetIndex]] = [
      this.workflowApproverSearches[targetIndex],
      this.workflowApproverSearches[levelIndex],
    ];
  }
  setWorkflowRule(levelIndex: number, rule: 'any' | 'all'): void {
    this.workflowForm.approvalLevels[levelIndex].rule = rule;
  }
  saveWorkflow(): void {
    if (!this.workflowForm.name.trim() || !this.workflowForm.approvalLevels.length) {
      this.workflowError.set('Completa el nombre y agrega al menos un nivel de aprobación.');
      return;
    }
    if (this.workflowForm.approvalLevels.some((level) => !level.approvers.length)) {
      this.workflowError.set('Cada nivel debe tener al menos un aprobador.');
      return;
    }
    this.workflowService.save(
      {
        name: this.workflowForm.name.trim(),
        description: this.workflowForm.description.trim(),
        society: this.workflowForm.society,
        documentType: this.workflowForm.documentType,
        approvalLevels: this.workflowForm.approvalLevels.map((level) => ({
          ...level,
          approvers: [...level.approvers],
        })),
        isActive: this.editingWorkflow()?.isActive ?? true,
      },
      this.editingWorkflow()?.id,
    );
    this.closeWorkflowForm();
    this.showToast('El workflow de aprobación se guardó correctamente.');
  }
  toggleWorkflow(workflow: ApprovalWorkflow): void {
    this.workflowService.toggle(workflow.id);
  }
  statusClass(status: string): string {
    return status.toLowerCase().replaceAll(' ', '-');
  }
}

function isRoleInternal(role: Role | undefined): boolean {
  return role === 'Colaborador interno';
}
