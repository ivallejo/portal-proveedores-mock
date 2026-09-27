import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { MockUsersStore } from './mock-users.store';

export interface SapProvider {
  ruc: string;
  companyName: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class SapProviderService {
  private readonly users = inject(MockUsersStore);

  lookupByRuc(ruc: string): Observable<SapProvider> {
    const normalizedRuc = ruc.replace(/\D/g, '');
    if (!/^\d{11}$/.test(normalizedRuc)) {
      return throwError(() => new Error('Ingresa un RUC válido de 11 dígitos.')).pipe(delay(500));
    }
    const provider = this.providers[normalizedRuc];
    if (!provider)
      return throwError(() => new Error('No encontramos información para el RUC indicado.')).pipe(
        delay(700),
      );
    return of({ ...provider, email: this.obfuscateEmail(provider.email) }).pipe(delay(700));
  }

  requestAccessKey(provider: SapProvider): Observable<{ sent: boolean; email: string }> {
    const source = this.providers[provider.ruc];
    if (source) {
      const current = this.users.findByIdentifier(provider.ruc);
      this.users.save({
        id: current?.id || `mock-provider-${provider.ruc}`,
        username: provider.ruc,
        email: source.email,
        companyName: source.companyName,
        ruc: source.ruc,
        password: 'DemoKey_123!',
        role: 'Proveedor',
        roles: ['Proveedor'],
        isActive: true,
        createdAtUtc: current?.createdAtUtc || new Date().toISOString(),
      });
    }
    return of({ sent: true, email: provider.email }).pipe(delay(900));
  }

  private readonly providers: Record<string, SapProvider> = {
    '20123456789': {
      ruc: '20123456789',
      companyName: 'Servicios Integrales del Pacífico S.A.C.',
      email: 'contacto@serviciospacifico.com',
    },
    '20523682785': {
      ruc: '20523682785',
      companyName: 'AD COMPUTERS S.A.C.',
      email: 'administracion@adcomputers.com',
    },
  };

  private obfuscateEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return email;
    const domainParts = domain.split('.');
    const domainName = domainParts.shift() || domain;
    const domainSuffix = domainParts.length ? `.${domainParts.join('.')}` : '';
    return `${localPart.slice(0, 3)}*****${domainName.slice(-3)}${domainSuffix}`;
  }
}
