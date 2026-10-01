import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { MockUsersStore } from '../../../../shared/state/mock-users.store';
import { roleLabel } from '../../../../shared/models/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  readonly auth = inject(AuthService);
  readonly users = inject(MockUsersStore);
  readonly roleLabel = roleLabel;
  readonly newEmail = signal('');
  readonly message = signal('');
  readonly error = signal('');
  readonly record = computed(() => {
    const user = this.auth.user();
    return user ? this.users.findByIdentifier(user.username) : undefined;
  });
  readonly emails = computed(() => {
    const record = this.record();
    return record?.emails?.length ? record.emails : record?.email ? [record.email] : [];
  });

  addEmail(): void {
    const email = this.newEmail().trim().toLowerCase();
    const record = this.record();
    if (!record) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.error.set('Ingresa un correo electrónico válido.');
      this.message.set('');
      return;
    }
    if (this.emails().some((item) => item.toLowerCase() === email)) {
      this.error.set('Ese correo ya está registrado en tu perfil.');
      this.message.set('');
      return;
    }
    this.users.update(record.id, { emails: [...this.emails(), email] });
    this.newEmail.set('');
    this.error.set('');
    this.message.set('Correo agregado correctamente.');
  }

  setPrimary(email: string): void {
    const record = this.record();
    if (!record || record.email === email) return;
    this.users.update(record.id, { email });
    this.message.set('Correo principal actualizado.');
    this.error.set('');
  }

  removeEmail(email: string): void {
    const record = this.record();
    if (!record || record.email === email) {
      this.error.set('El correo principal no se puede eliminar.');
      this.message.set('');
      return;
    }
    this.users.update(record.id, { emails: this.emails().filter((item) => item !== email) });
    this.message.set('Correo eliminado correctamente.');
    this.error.set('');
  }
}
