import { HttpErrorResponse } from '@angular/common/http';
import { toProviderLookupError } from './provider.mapper';

const http = (status: number, message?: string, code?: string) =>
  new HttpErrorResponse({ status, error: message ? { message, code } : null });

describe('toProviderLookupError', () => {
  it('classifies why a RUC cannot be registered', () => {
    expect(toProviderLookupError(http(409, 'Ya registrado.'))).toEqual(
      jasmine.objectContaining({ failure: 'already-registered', message: 'Ya registrado.' }),
    );
    expect(toProviderLookupError(http(400, 'Sin correo.', 'PROVIDER_EMAIL_MISSING')).failure).toBe(
      'missing-email',
    );
    expect(toProviderLookupError(http(400, 'Falta un dato en SAP.')).failure).toBe(
      'cannot-register',
    );
    expect(toProviderLookupError(http(400)).failure).toBe('not-found');
    expect(toProviderLookupError(http(0)).failure).toBe('unavailable');
    expect(toProviderLookupError(http(503)).failure).toBe('unavailable');
    expect(toProviderLookupError(http(404)).failure).toBe('not-found');
  });
});
