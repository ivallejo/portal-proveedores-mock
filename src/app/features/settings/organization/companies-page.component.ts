import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PageLoadingService } from '../../../core/layout/page-loading.service';
import { CatalogService } from '../../../shared/data/catalog.service';
import { apiErrorMessage } from '../../../shared/utils/api-errors';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ConfirmDialogComponent } from '../../../shared/ui/dialog/confirm-dialog.component';
import { DrawerComponent } from '../../../shared/ui/drawer/drawer.component';
import {
  CalloutComponent,
  EmptyStateComponent,
} from '../../../shared/ui/feedback/feedback.components';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import {
  KpiCardComponent,
  PageHeaderComponent,
  PaginationComponent,
} from '../../../shared/ui/page/page.components';
import { SelectComponent } from '../../../shared/ui/select/select.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Company, CompanyInput, OrganizationService } from './organization.service';
import { StatusFilter, includesTerm, matchesStatus, statusOptions } from './status';

const PAGE_SIZE = 10;
const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
type Errors = Partial<Record<keyof CompanyInput, string>>;

/** Configuración › Sociedades: empresas del grupo, su RUC y su correo de facturación. */
@Component({
  selector: 'app-companies-page',
  imports: [
    PageHeaderComponent,
    PaginationComponent,
    KpiCardComponent,
    SelectComponent,
    BadgeComponent,
    IconComponent,
    SpinnerComponent,
    EmptyStateComponent,
    CalloutComponent,
    DrawerComponent,
    ConfirmDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './companies-page.component.html',
})
export class CompaniesPageComponent {
  private readonly api = inject(OrganizationService);
  private readonly catalog = inject(CatalogService);
  private readonly toast = inject(ToastService);

  readonly statusOptions = statusOptions(true);
  readonly pageSize = PAGE_SIZE;

  readonly companies = signal<Company[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly draft = signal({ search: '', status: '' as StatusFilter });
  readonly applied = signal({ search: '', status: '' as StatusFilter });
  readonly page = signal(1);

  /** `null`: cerrado; `'new'`: nueva; o la sociedad en edición. */
  readonly editing = signal<Company | 'new' | null>(null);
  readonly form = signal<CompanyInput>({ code: '', name: '', ruc: '', billingEmail: '' });
  readonly errors = signal<Errors>({});
  readonly showErrors = signal(false);
  readonly saveError = signal('');
  readonly saving = signal(false);

  readonly confirming = signal<Company | null>(null);
  readonly toggling = signal(false);

  readonly rows = computed(() => {
    const { search, status } = this.applied();
    return this.companies().filter(
      (company) =>
        matchesStatus(company.isActive, status) &&
        includesTerm(search, company.code, company.name, company.ruc),
    );
  });
  readonly pageRows = computed(() =>
    this.rows().slice((this.page() - 1) * PAGE_SIZE, this.page() * PAGE_SIZE),
  );
  readonly kpis = computed(() => {
    const all = this.companies();
    const active = all.filter((company) => company.isActive).length;
    return {
      total: String(all.length),
      active: String(active),
      inactive: String(all.length - active),
    };
  });
  readonly isNew = computed(() => this.editing() === 'new');

  constructor() {
    inject(PageLoadingService).bind(this.loading, 'Cargando sociedades');
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.companies().subscribe({
      next: (companies) => {
        this.companies.set(companies);
        this.loadError.set('');
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.loadError.set(apiErrorMessage(error, 'No pudimos cargar las sociedades.'));
      },
    });
  }

  setDraft(changes: Partial<{ search: string; status: StatusFilter }>): void {
    this.draft.update((draft) => ({ ...draft, ...changes }));
  }

  search(): void {
    this.applied.set({ ...this.draft() });
    this.page.set(1);
  }

  clear(): void {
    this.draft.set({ search: '', status: '' });
    this.search();
  }

  // ——— Panel de edición ———

  openNew(): void {
    this.form.set({ code: '', name: '', ruc: '', billingEmail: '' });
    this.openDrawer('new');
  }

  openEdit(company: Company): void {
    this.form.set({
      code: company.code,
      name: company.name,
      ruc: company.ruc ?? '',
      billingEmail: company.billingEmail ?? '',
    });
    this.openDrawer(company);
  }

  closeDrawer(): void {
    if (!this.saving()) this.editing.set(null);
  }

  setField(key: keyof CompanyInput, raw: string): void {
    const value =
      key === 'code'
        ? raw
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .slice(0, 5)
        : key === 'ruc'
          ? raw.replace(/\D/g, '').slice(0, 11)
          : raw;
    this.form.update((form) => ({ ...form, [key]: value }));
    if (this.showErrors()) this.errors.set(this.validate());
  }

  save(): void {
    const errors = this.validate();
    this.errors.set(errors);
    this.showErrors.set(true);
    if (Object.keys(errors).length) {
      this.saveError.set('Revisa los campos marcados.');
      return;
    }
    const editing = this.editing();
    const id = editing && editing !== 'new' ? editing.id : null;
    this.saveError.set('');
    this.saving.set(true);
    this.api.saveCompany(id, this.form()).subscribe({
      next: (company) => {
        this.saving.set(false);
        this.editing.set(null);
        this.toast.show(
          id ? `Sociedad ${company.code} actualizada` : `Sociedad ${company.code} creada`,
        );
        this.catalog.reload();
        this.load();
      },
      error: (error) => {
        this.saving.set(false);
        this.saveError.set(apiErrorMessage(error, 'No pudimos guardar la sociedad.'));
      },
    });
  }

  // ——— Activar / desactivar ———

  askToggle(company: Company): void {
    this.confirming.set(company);
  }

  confirmText(company: Company): string {
    return company.isActive
      ? `${company.name} dejará de aparecer en los filtros y los usuarios no podrán registrar documentos para ella. Sus ${company.areaCount} áreas y el historial se conservan.`
      : `${company.name} volverá a estar disponible en el portal.`;
  }

  toggle(): void {
    const company = this.confirming();
    if (!company) return;
    this.toggling.set(true);
    this.api.setCompanyStatus(company.id, !company.isActive).subscribe({
      next: (updated) => {
        this.toggling.set(false);
        this.confirming.set(null);
        this.companies.update((list) =>
          list.map((item) => (item.id === updated.id ? updated : item)),
        );
        this.toast.show(
          `Sociedad ${updated.code} ${updated.isActive ? 'activada' : 'desactivada'}`,
        );
        this.catalog.reload();
      },
      error: (error) => {
        this.toggling.set(false);
        this.confirming.set(null);
        this.toast.show(apiErrorMessage(error, 'No pudimos cambiar el estado.'));
      },
    });
  }

  private openDrawer(target: Company | 'new'): void {
    this.errors.set({});
    this.showErrors.set(false);
    this.saveError.set('');
    this.editing.set(target);
  }

  /** Las mismas reglas del backend, para avisar antes de enviar. */
  private validate(): Errors {
    const { code, name, ruc, billingEmail } = this.form();
    const errors: Errors = {};
    if (!code) errors.code = 'Ingresa el código.';
    else if (!/^[A-Z0-9]{2,5}$/.test(code)) errors.code = 'De 2 a 5 letras o números.';
    if (!name.trim()) errors.name = 'Ingresa la razón social.';
    if (!/^\d{11}$/.test(ruc)) errors.ruc = 'El RUC debe tener 11 dígitos.';
    else if (!ruc.startsWith('20')) errors.ruc = 'El RUC de una empresa empieza con 20.';
    if (!EMAIL.test(billingEmail.trim())) errors.billingEmail = 'Ingresa un correo válido.';
    return errors;
  }
}
