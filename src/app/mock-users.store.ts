import { Injectable, signal } from '@angular/core';
import { Role } from './models';

export interface MockUserRecord {
  id: string;
  username: string;
  email: string;
  companyName: string;
  ruc: string;
  password: string;
  role: Role;
  roles: Role[];
  isActive: boolean;
  createdAtUtc: string;
}

@Injectable({ providedIn: 'root' })
export class MockUsersStore {
  private readonly storageKey = 'portal-proveedores.mock-users';
  readonly users = signal<MockUserRecord[]>(this.load());

  constructor() {
    this.persist();
  }

  save(user: MockUserRecord): void {
    this.users.update((users) => {
      const exists = users.some((item) => item.id === user.id);
      return exists ? users.map((item) => (item.id === user.id ? user : item)) : [...users, user];
    });
    this.persist();
  }

  findByIdentifier(identifier: string): MockUserRecord | undefined {
    const value = identifier.trim().toLowerCase();
    return this.users().find(
      (user) => user.username.toLowerCase() === value || user.ruc.toLowerCase() === value,
    );
  }

  findById(id: string): MockUserRecord | undefined {
    return this.users().find((user) => user.id === id);
  }

  update(id: string, changes: Partial<MockUserRecord>): MockUserRecord | undefined {
    const current = this.findById(id);
    if (!current) return undefined;
    const updated = { ...current, ...changes };
    this.save(updated);
    return updated;
  }

  private persist(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.users()));
  }

  private load(): MockUserRecord[] {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const users = JSON.parse(stored) as MockUserRecord[];
        return users.map((user) => {
          const roles = user.roles?.length ? user.roles : [user.role];
          const username =
            user.username || (roles.includes('Proveedor') ? user.ruc : user.email.split('@')[0]);
          return { ...user, username, roles };
        });
      } catch {
        localStorage.removeItem(this.storageKey);
      }
    }
    return [
      {
        id: 'mock-admin',
        username: 'admin',
        email: 'admin@naviera.local',
        companyName: 'Administrador del sistema',
        ruc: 'ADMIN-SYSTEM',
        password: 'AdminLocal_12345!',
        role: 'Administrador',
        roles: ['Administrador'],
        isActive: true,
        createdAtUtc: new Date().toISOString(),
      },
      {
        id: 'mock-provider',
        username: '20123456789',
        email: 'proveedor@naviera.local',
        companyName: 'Proveedor Andino SAC',
        ruc: '20123456789',
        password: '1234',
        role: 'Proveedor',
        roles: ['Proveedor'],
        isActive: true,
        createdAtUtc: new Date().toISOString(),
      },
      {
        id: 'mock-approver',
        username: 'maria.torres',
        email: 'aprobador@naviera.local',
        companyName: 'María Torres',
        ruc: 'APPROVER-001',
        password: '1234',
        role: 'Área Usuaria',
        roles: ['Área Usuaria'],
        isActive: true,
        createdAtUtc: new Date().toISOString(),
      },
      {
        id: 'mock-internal',
        username: 'colaborador',
        email: 'colaborador@naviera.local',
        companyName: 'Colaborador interno',
        ruc: 'INTERNAL-001',
        password: '1234',
        role: 'Colaborador interno',
        roles: ['Colaborador interno'],
        isActive: true,
        createdAtUtc: new Date().toISOString(),
      },
      {
        id: 'mock-cxp',
        username: 'cxp',
        email: 'cxp@naviera.local',
        companyName: 'Cuentas por pagar',
        ruc: 'CXP-001',
        password: '1234',
        role: 'CxP',
        roles: ['CxP'],
        isActive: true,
        createdAtUtc: new Date().toISOString(),
      },
    ];
  }
}
