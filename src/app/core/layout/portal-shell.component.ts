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
  styleUrls: ['./portal-shell.component.scss'],
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
  initials(): string {
    return (this.auth.user()?.name || 'US')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }
  screenLabel(): string {
    const labels: Record<Screen, string> = {
      dashboard: 'Inicio',
      registrar: 'Registrar documento',
      documentos: 'Mis documentos',
      consultas: 'Consultas',
      perfil: 'Mi perfil',
      usuarios: 'Usuarios y roles',
      workflows: 'Workflows',
      aprobaciones: 'Aprobaciones',
      contabilizacion: 'Contabilización',
    };
    return labels[this.screen()];
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
  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }
  logout(): void {
    this.loggedOut.emit();
    this.userMenuOpen.set(false);
  }
}
