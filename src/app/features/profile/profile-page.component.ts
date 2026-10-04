import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { roleLabel } from '../../shared/models/models';
import { MockUserRecord, MockUsersStore } from '../../shared/state/mock-users.store';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { CalloutComponent } from '../../shared/ui/feedback/feedback.components';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { PageHeaderComponent } from '../../shared/ui/page/page.components';
import { initials } from '../../shared/utils/format';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

@Component({
  selector: 'app-profile-page',
  imports: [PageHeaderComponent, BadgeComponent, IconComponent, CalloutComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      heading="Mi perfil"
      description="Administra tus datos de acceso y correos asociados."
    />

    <div class="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
      <section class="card flex flex-col items-center gap-3 px-6 py-8 text-center">
        <span
          class="flex size-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white"
          >{{ userInitials() }}</span
        >
        <h2 class="m-0 text-xl font-bold">{{ name() }}</h2>
        <p class="m-0 text-sm text-muted tabular-nums">{{ user()?.username }}</p>
        <div class="flex flex-wrap justify-center gap-2">
          @for (role of user()?.roles ?? []; track role) {
            <app-badge tone="primary">{{ roleLabel(role) }}</app-badge>
          }
        </div>
      </section>

      <section class="card flex flex-col gap-5 px-6 py-6">
        <div class="flex flex-col gap-1">
          <h2 class="m-0 text-lg font-bold">Información de usuario</h2>
          <p class="m-0 text-sm text-muted">Estos datos son administrados por el sistema.</p>
        </div>
        <dl class="m-0 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          @for (field of fields(); track field.label) {
            <div class="flex flex-col gap-1 rounded-xl bg-surface-alt px-4 py-3">
              <dt class="text-xs text-muted">{{ field.label }}</dt>
              <dd class="m-0 text-[15px] font-bold tabular-nums">{{ field.value }}</dd>
            </div>
          }
        </dl>
      </section>
    </div>

    <section class="card flex flex-col gap-5 px-6 py-6">
      <div class="flex items-start justify-between gap-4">
        <div class="flex flex-col gap-1">
          <h2 class="m-0 text-lg font-bold">Correos electrónicos</h2>
          <p class="m-0 text-sm text-muted">
            Puedes asociar más de un correo y seleccionar cuál será el principal.
          </p>
        </div>
        <span
          class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"
        >
          <app-icon name="mail" [size]="22" />
        </span>
      </div>

      <div class="flex flex-col gap-2.5">
        @for (email of emails(); track email) {
          <div class="flex flex-wrap items-center gap-3 rounded-xl border border-line px-4 py-3">
            <app-icon name="mail" [size]="18" class="text-primary" />
            <div class="flex min-w-0 grow flex-col">
              <span class="truncate text-sm font-bold">{{ email }}</span>
              @if (email === primaryEmail()) {
                <span class="text-xs text-success-text">Correo principal</span>
              }
            </div>
            @if (email !== primaryEmail()) {
              <button
                type="button"
                class="btn btn-tint h-9 px-3 text-[13px]"
                (click)="setPrimary(email)"
              >
                Hacer principal
              </button>
              <button
                type="button"
                class="flex size-9 items-center justify-center rounded-lg border border-line text-muted hover:text-danger-text"
                title="Eliminar correo"
                [attr.aria-label]="'Eliminar ' + email"
                (click)="remove(email)"
              >
                <app-icon name="trash" [size]="17" />
              </button>
            }
          </div>
        } @empty {
          <p class="m-0 text-sm text-muted">Aún no tienes correos registrados.</p>
        }
      </div>

      <form class="flex flex-col gap-2.5 sm:flex-row" (submit)="add($event)">
        <label class="sr-only" for="profile-email">Nuevo correo</label>
        <input
          id="profile-email"
          type="email"
          class="field sm:max-w-md"
          placeholder="nuevo.correo@empresa.com"
          [value]="newEmail()"
          (input)="newEmail.set($any($event.target).value); error.set('')"
          [attr.aria-invalid]="!!error()"
        />
        <button type="submit" class="btn btn-primary">
          <app-icon name="plus" [size]="18" [stroke]="2.2" />Agregar correo
        </button>
      </form>
      @if (message()) {
        <app-callout tone="success">{{ message() }}</app-callout>
      }
      @if (error()) {
        <app-callout tone="danger">{{ error() }}</app-callout>
      }
    </section>
  `,
})
export class ProfilePageComponent {
  private readonly auth = inject(AuthService);
  private readonly users = inject(MockUsersStore);

  readonly roleLabel = roleLabel;
  readonly user = this.auth.user;
  readonly newEmail = signal('');
  readonly message = signal('');
  readonly error = signal('');

  readonly record = computed(() => {
    const user = this.user();
    return user ? this.users.findByIdentifier(user.username) : undefined;
  });
  readonly name = computed(() => this.record()?.companyName || this.user()?.name || '');
  readonly userInitials = computed(() => initials(this.name()));
  readonly primaryEmail = computed(() => this.record()?.email || this.user()?.email || '');
  readonly emails = computed(() => {
    const record = this.record();
    if (record?.emails?.length) return record.emails;
    const primary = this.primaryEmail();
    return primary ? [primary] : [];
  });
  readonly fields = computed(() => {
    const user = this.user();
    const record = this.record();
    return [
      { label: 'Usuario', value: user?.username || '—' },
      { label: 'RUC / identificador', value: record?.ruc || user?.providerId || '—' },
      { label: 'Área', value: record?.area || user?.area || 'No asignada' },
      { label: 'Nombre o empresa', value: this.name() || '—' },
    ];
  });

  add(event: Event): void {
    event.preventDefault();
    const email = this.newEmail().trim().toLowerCase();
    this.message.set('');
    if (!EMAIL_PATTERN.test(email)) {
      this.error.set('Ingresa un correo electrónico válido.');
      return;
    }
    if (this.emails().some((item) => item.toLowerCase() === email)) {
      this.error.set('Ese correo ya está registrado en tu perfil.');
      return;
    }
    this.persist({ emails: [...this.emails(), email] });
    this.newEmail.set('');
    this.message.set('Correo agregado correctamente.');
  }

  setPrimary(email: string): void {
    this.persist({ email });
    this.error.set('');
    this.message.set('Correo principal actualizado.');
  }

  remove(email: string): void {
    if (email === this.primaryEmail()) {
      this.error.set('El correo principal no se puede eliminar.');
      return;
    }
    this.persist({ emails: this.emails().filter((item) => item !== email) });
    this.error.set('');
    this.message.set('Correo eliminado correctamente.');
  }

  /** Mientras no exista el endpoint de perfil, los correos se guardan en el almacén local. */
  private persist(changes: Partial<MockUserRecord>): void {
    const user = this.user();
    if (!user) return;
    const record = this.record();
    if (record) {
      this.users.update(record.id, changes);
      return;
    }
    this.users.save({
      id: `profile-${user.username}`,
      username: user.username,
      email: user.email ?? '',
      emails: this.emails(),
      companyName: user.name,
      area: user.area ?? '',
      ruc: user.providerId ?? '',
      password: '',
      role: user.role,
      roles: user.roles,
      isActive: true,
      createdAtUtc: new Date().toISOString(),
      ...changes,
    });
  }
}
