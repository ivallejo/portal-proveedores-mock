import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { NavigationService, Screen } from '../navigation/navigation.service';
import { Role, roleLabel } from '../../shared/models/models';

@Component({
  selector: 'app-portal-shell',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './portal-shell.component.html',
})
export class PortalShellComponent {
  readonly auth = inject(AuthService);
  readonly navigation = inject(NavigationService);
  readonly screen = this.navigation.screen;
  readonly roleLabel = roleLabel;
  readonly menuOpen = signal(false);
  readonly userMenuOpen = signal(false);
  @Input() error = '';
  @Output() readonly navigateTo = new EventEmitter<Screen>();
  @Output() readonly loggedOut = new EventEmitter<void>();

  isRole(role: Role): boolean {
    return this.auth.user()?.role === role;
  }
  navigate(screen: Screen): void {
    this.menuOpen.set(false);
    this.navigateTo.emit(screen);
  }
  setActiveRole(role: Role): void {
    this.auth.setActiveRole(role);
    this.navigateTo.emit(this.landingScreen());
  }
  landingScreen(): Screen {
    const role = this.auth.user()?.role;
    if (role === 'Colaborador interno') return 'registrar';
    if (role === 'Área Usuaria') return 'aprobaciones';
    if (role === 'CxP') return 'contabilizacion';
    return 'dashboard';
  }
  toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
  }
  logout(): void {
    this.loggedOut.emit();
    this.userMenuOpen.set(false);
  }
}
