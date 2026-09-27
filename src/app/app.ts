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
import { SapProviderService } from './sap-provider.service';
import { environment } from '../environments/environment';
import { Documento, DocumentType, Role, SpecialSubtype } from './models';

type Screen =
  | 'dashboard'
  | 'registrar'
  | 'documentos'
  | 'consultas'
  | 'perfil'
  | 'usuarios'
  | 'aprobaciones'
  | 'contabilizacion';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, AdminUsersComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss', './theme.scss', './readability.scss'],
})
export class App {
  readonly auth = inject(AuthService);
  readonly documentoService = inject(DocumentoService);
  readonly aprobacionService = inject(AprobacionService);
  readonly contabilizacionService = inject(ContabilizacionService);
  readonly adminService = inject(AdminService);
  readonly sapProviderService = inject(SapProviderService);
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
  readonly username = signal(environment.defaultLoginUsername);
  readonly password = signal(environment.defaultLoginPassword);
  readonly filterStatus = signal('');
  readonly filterType = signal('');
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
  readonly uploadedFiles = signal<{ name: string; kind: string }[]>([]);
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
    providerId: 'P-1001',
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
    this.providerDocuments().filter(
      (item) =>
        (!this.filterStatus() || item.status === this.filterStatus()) &&
        (!this.filterType() || item.tipo === this.filterType()),
    ),
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
  addFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []).map((file) => {
      const fileName = file.name.toLowerCase();
      const extension = file.name.split('.').pop()?.toUpperCase() || 'PDF';
      const isCdr = extension === 'XML' && /cdr|constancia|acuse/.test(fileName);
      return { name: file.name, kind: isCdr ? 'CDR' : extension };
    });
    this.uploadedFiles.update((current) => [...current, ...files]);
    if (files.some((file) => file.kind === 'XML')) {
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
    this.contabilizacionService
      .pendientes(this.accountingSociety(), this.accountingType())
      .subscribe((items) => {
        this.accountingItems.set(items);
        this.loading.set(false);
      });
  }
  toggle(id: number): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }
  setType(type: DocumentType): void {
    this.form.tipo = type;
    this.ocValidated.set(false);
    if (type !== 'Documento especial') this.selectedSpecial.set('');
    if (type === 'Con Orden de Compra') this.form.validateSunat = true;
  }
  isSunatDocument(): boolean {
    return this.form.numero.trim().toUpperCase().startsWith('E');
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
    const missingProviderFiles =
      this.isRole('Proveedor') && (!hasPdf || !hasXml || (!this.isSunatDocument() && !hasCdr));
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
        this.message.set(`Documento ${item.numero} recibido correctamente.`);
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
    void Swal.fire({
      icon,
      text,
      confirmButtonColor: '#253c6d',
      buttonsStyling: true,
    });
  }
  private showToast(text: string): void {
    void Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      text,
      showConfirmButton: false,
      timer: 4500,
      timerProgressBar: true,
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
  account(id: number): void {
    const route = this.accountingRoute()[id];
    if (!route) {
      this.error.set('Selecciona SAP o Sertica antes de contabilizar.');
      return;
    }
    this.loading.set(true);
    this.contabilizacionService.contabilizar(id, route).subscribe((item) => {
      this.loading.set(false);
      if (item.status === 'Contabilizado')
        this.message.set(`Documento contabilizado correctamente vía ${route}.`);
      else this.error.set('Se generó una incidencia de contabilización.');
      this.loadAccounting();
    });
  }
  retry(id: number, route: 'SAP' | 'Sertica'): void {
    this.loading.set(true);
    this.contabilizacionService.retry(id, route).subscribe(() => {
      this.loading.set(false);
      this.loadAccounting();
    });
  }
  routeFor(id: number): 'SAP' | 'Sertica' {
    return this.accountingRoute()[id] || 'SAP';
  }
  setRoute(id: number, route: 'SAP' | 'Sertica'): void {
    this.accountingRoute.update((values) => ({ ...values, [id]: route }));
  }
  setComment(id: number, value: string): void {
    this.approvalComment.update((values) => ({ ...values, [id]: value }));
  }
  setApprovalTarget(id: number, value: string): void {
    this.approvalTarget.update((values) => ({ ...values, [id]: value }));
  }
  statusClass(status: string): string {
    return status.toLowerCase().replaceAll(' ', '-');
  }
}

function isRoleInternal(role: Role | undefined): boolean {
  return role === 'Colaborador interno';
}
