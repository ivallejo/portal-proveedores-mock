import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AprobacionService } from './aprobacion.service';
import { AuthService } from './auth.service';
import { ContabilizacionService } from './contabilizacion.service';
import { DocumentoService } from './documento.service';
import { DocumentType, Role, SpecialSubtype } from './models';

type Screen = 'dashboard' | 'registrar' | 'documentos' | 'aprobaciones' | 'contabilizacion';

@Component({ selector: 'app-root', imports: [CommonModule, FormsModule], templateUrl: './app.html', styleUrls: ['./app.scss', './theme.scss'] })
export class App {
  readonly auth = inject(AuthService);
  readonly documentoService = inject(DocumentoService);
  readonly aprobacionService = inject(AprobacionService);
  readonly contabilizacionService = inject(ContabilizacionService);
  readonly screen = signal<Screen>('dashboard');
  readonly menuOpen = signal(false);
  readonly loading = signal(false);
  readonly message = signal('');
  readonly error = signal('');
  readonly expandedId = signal<number | null>(null);
  readonly documents = this.documentoService.documents;
  readonly approvalItems = signal(this.documents().filter((item) => item.status === 'Pendiente de aprobación'));
  readonly accountingItems = signal(this.documents().filter((item) => item.status === 'Pendiente de contabilización'));
  readonly username = signal('proveedor');
  readonly password = signal('1234');
  readonly filterStatus = signal('');
  readonly filterType = signal('');
  readonly approvalComment = signal<Record<number, string>>({});
  readonly accountingRoute = signal<Record<number, 'SAP' | 'Sertica'>>({});
  readonly showPassword = signal(false);
  readonly userMenuOpen = signal(false);
  readonly accountingSociety = signal('');
  readonly accountingType = signal('');
  readonly selectedSpecial = signal<SpecialSubtype | ''>('');
  readonly documentTypes: DocumentType[] = ['Con Orden de Compra', 'Sin Orden de Compra', 'Documento especial'];
  readonly specialTypes: SpecialSubtype[] = ['Boleto aéreo', 'Recibo público', 'No domiciliado', 'Liquidación de cobranza'];
  private demoSequence = 205;
  readonly form = { numero: 'F001-000205', proveedor: 'Proveedor Andino SAC', providerId: 'P-1001', sociedad: 'Naviera Transoceánica S.A.', tipo: 'Con Orden de Compra' as DocumentType, oc: 'OC-45000128', importe: 1850, fecha: '2026-05-21', aprobador: 'María Torres', validateSunat: true, details: { vuelo: 'LA2451', pasajero: 'Juan Sebastián', servicio: 'Energía eléctrica', suministro: 'SUM-004589', concepto: 'Servicio profesional especializado' } };
  readonly providerDocuments = computed(() => this.documents().filter((item) => this.auth.user()?.role !== 'Proveedor' || item.providerId === this.auth.user()?.providerId));
  readonly filteredDocuments = computed(() => this.providerDocuments().filter((item) => (!this.filterStatus() || item.status === this.filterStatus()) && (!this.filterType() || item.tipo === this.filterType())));
  readonly pendingCount = computed(() => this.providerDocuments().filter((item) => ['Pendiente de aprobación', 'Pendiente de contabilización'].includes(item.status)).length);
  readonly approvedCount = computed(() => this.providerDocuments().filter((item) => ['Aprobado', 'Pendiente de contabilización', 'Contabilizado'].includes(item.status)).length);
  readonly rejectedCount = computed(() => this.providerDocuments().filter((item) => ['Rechazado', 'Devuelto al proveedor'].includes(item.status)).length);

  login(): void {
    this.error.set(''); this.loading.set(true);
    this.auth.login(this.username(), this.password()).subscribe({ next: () => { this.loading.set(false); this.screen.set('dashboard'); }, error: (err) => { this.loading.set(false); this.error.set(err.message); } });
  }
  quickLogin(username: string): void { this.username.set(username); this.password.set('1234'); this.login(); }
  toggleUserMenu(): void { this.userMenuOpen.update((open) => !open); }
  logout(): void { this.auth.logout(); this.screen.set('dashboard'); this.username.set('proveedor'); this.password.set('1234'); this.showPassword.set(false); this.userMenuOpen.set(false); }
  prepareScenario(scenario: 'oc' | 'sin-oc' | 'especial'): void {
    const sequence = ++this.demoSequence;
    this.form.numero = scenario === 'oc' ? `F001-${String(sequence).padStart(6, '0')}` : scenario === 'sin-oc' ? `B001-${String(sequence).padStart(6, '0')}` : `E001-${String(sequence).padStart(6, '0')}`;
    this.form.oc = scenario === 'oc' ? `OC-45000${sequence}` : '';
    this.form.importe = scenario === 'oc' ? 1850 : scenario === 'sin-oc' ? 640 : 920;
    this.form.tipo = scenario === 'oc' ? 'Con Orden de Compra' : scenario === 'sin-oc' ? 'Sin Orden de Compra' : 'Documento especial';
    this.form.validateSunat = true;
    this.selectedSpecial.set(scenario === 'especial' ? 'Boleto aéreo' : '');
    this.form.details = { vuelo: 'LA2451', pasajero: 'Juan Sebastián', servicio: 'Energía eléctrica', suministro: 'SUM-004589', concepto: 'Servicio profesional especializado' };
    this.navigate('registrar');
  }
  navigate(screen: Screen): void { this.error.set(''); this.message.set(''); this.screen.set(screen); this.menuOpen.set(false); if (screen === 'aprobaciones') this.loadApprovals(); if (screen === 'contabilizacion') this.loadAccounting(); }
  isRole(role: Role): boolean { return this.auth.user()?.role === role; }
  loadApprovals(): void { this.loading.set(true); this.aprobacionService.pendientes().subscribe((items) => { this.approvalItems.set(items); this.loading.set(false); }); }
  loadAccounting(): void { this.loading.set(true); this.contabilizacionService.pendientes(this.accountingSociety(), this.accountingType()).subscribe((items) => { this.accountingItems.set(items); this.loading.set(false); }); }
  toggle(id: number): void { this.expandedId.set(this.expandedId() === id ? null : id); }
  setType(type: DocumentType): void { this.form.tipo = type; if (type !== 'Documento especial') this.selectedSpecial.set(''); if (type === 'Con Orden de Compra') this.form.validateSunat = true; }
  submitDocument(): void {
    this.error.set(''); this.message.set('');
    if (!this.form.numero || !this.form.importe || (this.form.tipo === 'Con Orden de Compra' && !this.form.oc) || (this.form.tipo === 'Documento especial' && !this.selectedSpecial())) { this.error.set('Completa los campos obligatorios para continuar.'); return; }
    this.loading.set(true);
    const dto = { ...this.form, subtipo: this.selectedSpecial() || undefined, details: { ...this.form.details } };
    this.documentoService.registrarDocumento(dto).subscribe({ next: (item) => { this.loading.set(false); this.message.set(`Documento ${item.numero} registrado. Estado: ${item.status}.`); this.resetForm(); this.screen.set('documentos'); }, error: (err) => { this.loading.set(false); this.error.set(err.message); } });
  }
  resetForm(): void { this.demoSequence += 1; this.form.numero = `F001-${String(this.demoSequence).padStart(6, '0')}`; this.form.oc = `OC-45000${this.demoSequence}`; this.form.importe = 1850; this.form.fecha = '2026-05-21'; this.form.tipo = 'Con Orden de Compra'; this.form.validateSunat = true; this.selectedSpecial.set(''); this.form.details = { vuelo: 'LA2451', pasajero: 'Juan Sebastián', servicio: 'Energía eléctrica', suministro: 'SUM-004589', concepto: 'Servicio profesional especializado' }; }
  approve(id: number): void { this.loading.set(true); this.aprobacionService.aprobar(id).subscribe((item) => { this.loading.set(false); this.message.set(`Documento ${item.numero} aprobado y enviado a contabilización.`); this.loadApprovals(); }); }
  reject(id: number): void { const comment = this.approvalComment()[id]?.trim(); if (!comment) { this.error.set('El comentario es obligatorio para rechazar.'); return; } this.loading.set(true); this.aprobacionService.rechazar(id, comment).subscribe((item) => { this.loading.set(false); this.message.set(`Documento ${item.numero} rechazado.`); this.loadApprovals(); }); }
  account(id: number): void { const route = this.accountingRoute()[id]; if (!route) { this.error.set('Selecciona SAP o Sertica antes de contabilizar.'); return; } this.loading.set(true); this.contabilizacionService.contabilizar(id, route).subscribe((item) => { this.loading.set(false); if (item.status === 'Contabilizado') this.message.set(`Documento contabilizado correctamente vía ${route}.`); else this.error.set('Se generó una incidencia de contabilización.'); this.loadAccounting(); }); }
  retry(id: number, route: 'SAP' | 'Sertica'): void { this.loading.set(true); this.contabilizacionService.retry(id, route).subscribe(() => { this.loading.set(false); this.loadAccounting(); }); }
  routeFor(id: number): 'SAP' | 'Sertica' { return this.accountingRoute()[id] || 'SAP'; }
  setRoute(id: number, route: 'SAP' | 'Sertica'): void { this.accountingRoute.update((values) => ({ ...values, [id]: route })); }
  setComment(id: number, value: string): void { this.approvalComment.update((values) => ({ ...values, [id]: value })); }
  statusClass(status: string): string { return status.toLowerCase().replaceAll(' ', '-'); }
}
