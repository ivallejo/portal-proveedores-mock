import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminUser } from './admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./app.scss', './theme.scss', './readability.scss'],
})
export class AdminUsersComponent {
  private readonly adminService = inject(AdminService);

  @Output() readonly close = new EventEmitter<void>();

  readonly users = signal<AdminUser[]>([]);
  readonly allUsers = signal<AdminUser[]>([]);
  readonly loading = signal(false);
  readonly message = signal('');
  readonly error = signal('');
  readonly search = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly showForm = signal(false);
  readonly selectedRole = signal('Área Usuaria');
  readonly roles = ['Proveedor', 'Área Usuaria', 'CxP', 'Administrador'];
  readonly newUser = { email: '', companyName: '', ruc: '', password: '' };

  readonly filteredUsers = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.allUsers().filter(
      (user) =>
        !term ||
        `${user.companyName} ${user.email} ${user.ruc} ${user.role}`.toLowerCase().includes(term),
    );
  });
  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filteredUsers().length / this.pageSize())),
  );
  readonly paginationPages = computed(() =>
    Array.from({ length: this.pageCount() }, (_, index) => index + 1),
  );

  constructor() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.adminService.list().subscribe({
      next: (users) => {
        this.allUsers.set(users);
        this.page.set(1);
        this.refreshPage();
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.error.set(error.error?.message || 'No fue posible cargar los usuarios.');
      },
    });
  }

  setSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
    this.refreshPage();
  }
  setPage(value: number): void {
    this.page.set(Math.min(Math.max(value, 1), this.pageCount()));
    this.refreshPage();
  }
  setPageSize(value: number | string): void {
    this.pageSize.set(Number(value));
    this.page.set(1);
    this.refreshPage();
  }
  private refreshPage(): void {
    const start = (this.page() - 1) * this.pageSize();
    this.users.set(this.filteredUsers().slice(start, start + this.pageSize()));
  }

  openForm(): void {
    this.error.set('');
    this.message.set('');
    this.showForm.set(true);
  }
  closeForm(): void {
    this.showForm.set(false);
    this.error.set('');
  }

  createUser(): void {
    this.message.set('');
    this.error.set('');
    if (
      !this.newUser.email ||
      !this.newUser.companyName ||
      !this.newUser.ruc ||
      !this.newUser.password
    ) {
      this.error.set('Completa todos los campos para crear el usuario.');
      return;
    }
    this.loading.set(true);
    this.adminService.create({ ...this.newUser, role: this.selectedRole() }).subscribe({
      next: () => {
        this.loading.set(false);
        this.message.set('Usuario creado correctamente.');
        this.newUser.email = '';
        this.newUser.companyName = '';
        this.newUser.ruc = '';
        this.newUser.password = '';
        this.showForm.set(false);
        this.loadUsers();
      },
      error: (error) => {
        this.loading.set(false);
        this.error.set(error.error?.message || 'No fue posible crear el usuario.');
      },
    });
  }

  changeRole(user: AdminUser, role: string): void {
    this.adminService.assignRole(user.id, role).subscribe({
      next: (updated) => {
        this.allUsers.update((users) =>
          users.map((item) => (item.id === updated.id ? updated : item)),
        );
        this.refreshPage();
      },
      error: (error) => this.error.set(error.error?.message || 'No fue posible actualizar el rol.'),
    });
  }

  toggleStatus(user: AdminUser): void {
    this.adminService.setStatus(user.id, !user.isActive).subscribe({
      next: (updated) => {
        this.allUsers.update((users) =>
          users.map((item) => (item.id === updated.id ? updated : item)),
        );
        this.refreshPage();
      },
      error: (error) =>
        this.error.set(error.error?.message || 'No fue posible actualizar el estado.'),
    });
  }
}
