import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { NavigationService, Screen } from '../navigation/navigation.service';
import { Role } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class PortalFacade {
  readonly auth = inject(AuthService);
  readonly navigation = inject(NavigationService);
  readonly screen = this.navigation.screen;
  readonly loading = signal(false);
  readonly message = signal('');
  readonly error = signal('');
  logout(): void {
    this.auth.logout();
    this.navigation.goTo('dashboard');
  }
  navigate(screen: Screen): void {
    this.error.set('');
    this.message.set('');
    this.navigation.goTo(screen);
  }
  isRole(role: Role): boolean {
    return this.auth.user()?.role === role;
  }
  statusClass(status: string): string {
    return status.toLowerCase().replaceAll(' ', '-');
  }
}

function isRoleInternal(role: Role | undefined): boolean {
  return role === 'Colaborador interno';
}
