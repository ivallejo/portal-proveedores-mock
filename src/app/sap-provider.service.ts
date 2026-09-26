import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';

export interface SapProvider {
  ruc: string;
  companyName: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class SapProviderService {
  lookupByRuc(ruc: string): Observable<SapProvider> {
    const normalizedRuc = ruc.trim();
    if (!/^\d{11}$/.test(normalizedRuc)) {
      return throwError(() => new Error('Ingresa un RUC válido de 11 dígitos.')).pipe(delay(500));
    }

    const providers: Record<string, SapProvider> = {
      '20123456789': {
        ruc: normalizedRuc,
        companyName: 'Servicios Integrales del Pacífico S.A.C.',
        email: 'contacto@serviciospacifico.com',
      },
      '20523682785': {
        ruc: normalizedRuc,
        companyName: 'AD COMPUTERS S.A.C.',
        email: 'administracion@adcomputers.com',
      },
    };
    const provider = providers[normalizedRuc] ?? {
      ruc: normalizedRuc,
      companyName: `Proveedor registrado ${normalizedRuc.slice(-4)}`,
      email: `contacto${normalizedRuc.slice(-4)}@empresa.com`,
    };
    return of(provider).pipe(delay(700));
  }

  requestAccessKey(provider: SapProvider): Observable<{ sent: boolean; email: string }> {
    return of({ sent: true, email: provider.email }).pipe(delay(900));
  }
}
