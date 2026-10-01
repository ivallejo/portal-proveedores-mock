import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AdminService, AdminUser } from './admin.service';
import { Role, roleLabel } from './models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./app.scss', './theme.scss', './readability.scss'],
})
export class AdminUsersComponent {
  readonly roleLabel = roleLabel;
  private readonly adminService = inject(AdminService);

  @Output() readonly close = new EventEmitter<void>();

  readonly users = signal<AdminUser[]>([]);
  readonly allUsers = signal<AdminUser[]>([]);
  readonly loading = signal(false);
  readonly message = signal('');
  readonly error = signal('');
  readonly search = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(5);
  readonly showForm = signal(false);
  readonly showNewPassword = signal(false);
  readonly editingUser = signal<AdminUser | null>(null);
  readonly editRoles = signal<Role[]>([]);
  readonly editUser = { username: '', email: '', companyName: '', area: '', ruc: '' };
  readonly selectedRoles = signal<Role[]>(['Área Usuaria']);
  readonly roles: Role[] = [
    'Proveedor',
    'Colaborador interno',
    'Área Usuaria',
    'CxP',
    'Administrador',
  ];
  readonly newUser = { username: '', email: '', companyName: '', area: '', ruc: '', password: '' };
  readonly areas = [
    'Administración',
    'Abastecimiento',
    'Comercial',
    'Finanzas',
    'Mantenimiento',
    'Operaciones',
    'Recursos Humanos',
    'Tecnología',
  ];

  readonly filteredUsers = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.allUsers().filter(
      (user) =>
        !term ||
        `${user.companyName} ${user.email} ${user.area} ${user.ruc} ${user.roles.join(' ')}`
          .toLowerCase()
          .includes(term),
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
    this.showNewPassword.set(false);
    this.showForm.set(true);
  }
  openEdit(user: AdminUser): void {
    this.error.set('');
    this.message.set('');
    this.editingUser.set(user);
    this.editUser.username = user.username;
    this.editUser.email = user.email;
    this.editUser.companyName = user.companyName;
    this.editUser.area = user.area;
    this.editUser.ruc = user.ruc;
    this.editRoles.set([...user.roles]);
  }
  closeEdit(): void {
    this.editingUser.set(null);
    this.error.set('');
  }
  toggleEditRole(role: Role): void {
    this.editRoles.update((roles) =>
      roles.includes(role) ? roles.filter((item) => item !== role) : [...roles, role],
    );
  }
  saveEdit(): void {
    const user = this.editingUser();
    if (!user) return;
    this.error.set('');
    if (
      !this.editUser.username ||
      !this.editUser.email ||
      !this.editUser.companyName ||
      (this.hasInternalRole(this.editRoles()) && !this.editUser.area)
    ) {
      this.error.set('Completa los datos obligatorios del usuario.');
      return;
    }
    if (!this.editRoles().length) {
      this.error.set('El usuario debe conservar al menos un rol.');
      return;
    }
    this.loading.set(true);
    this.adminService.update(user.id, { ...this.editUser, roles: this.editRoles() }).subscribe({
      next: (updated) => {
        this.allUsers.update((users) =>
          users.map((item) => (item.id === updated.id ? updated : item)),
        );
        this.refreshPage();
        this.loading.set(false);
        this.editingUser.set(null);
        void Swal.fire({
          icon: 'success',
          title: 'Usuario actualizado',
          text: 'Los datos y roles del usuario se actualizaron correctamente.',
          confirmButtonColor: '#253c6d',
        });
      },
      error: (error) => {
        this.loading.set(false);
        this.error.set(error.error?.message || 'No fue posible actualizar el usuario.');
      },
    });
  }
  closeForm(): void {
    this.showForm.set(false);
    this.error.set('');
  }

  createUser(): void {
    this.message.set('');
    this.error.set('');
    if (
      !this.newUser.username ||
      !this.newUser.email ||
      !this.newUser.companyName ||
      !this.newUser.password ||
      !this.selectedRoles().length ||
      (this.hasInternalRole(this.selectedRoles()) && !this.newUser.area)
    ) {
      this.error.set('Completa todos los campos para crear el usuario.');
      return;
    }
    this.loading.set(true);
    this.adminService.create({ ...this.newUser, roles: this.selectedRoles() }).subscribe({
      next: () => {
        this.loading.set(false);
        this.message.set('Usuario creado correctamente.');
        this.newUser.username = '';
        this.newUser.email = '';
        this.newUser.companyName = '';
        this.newUser.area = '';
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

  changeRoles(user: AdminUser, roles: Role[]): void {
    this.adminService.assignRoles(user.id, roles).subscribe({
      next: (updated) => {
        this.allUsers.update((users) =>
          users.map((item) => (item.id === updated.id ? updated : item)),
        );
        this.refreshPage();
      },
      error: (error) => this.error.set(error.error?.message || 'No fue posible actualizar el rol.'),
    });
  }

  toggleRole(roles: Role[], role: Role): Role[] {
    return roles.includes(role) ? roles.filter((item) => item !== role) : [...roles, role];
  }

  setSelectedRoles(roles: Role[]): void {
    this.selectedRoles.set(roles.length ? roles : ['Proveedor']);
  }
  toggleSelectedRole(role: Role): void {
    this.selectedRoles.update((roles) =>
      roles.includes(role) ? roles.filter((item) => item !== role) : [...roles, role],
    );
  }
  hasInternalRole(roles: Role[]): boolean {
    return roles.some((role) => role !== 'Proveedor');
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
