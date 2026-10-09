import { HttpErrorResponse } from '@angular/common/http';
import { UserFacingError } from '../../shared/errors/user-facing-error';
import { userFacingMessage } from '../../shared/errors/user-facing-message';
import { toUserFacingError } from './to-user-facing-error';

describe('toUserFacingError', () => {
  it('keeps the backend message', () => {
    const error = toUserFacingError(
      new HttpErrorResponse({ status: 409, error: { message: 'El código ya existe.' } }),
    );
    expect(error).toEqual(jasmine.any(UserFacingError));
    expect(userFacingMessage(error, 'genérico')).toBe('El código ya existe.');
  });

  it('explains a connection failure', () => {
    const error = toUserFacingError(new HttpErrorResponse({ status: 0 }));
    expect(userFacingMessage(error, 'genérico')).toContain('No fue posible conectar');
  });

  it('leaves errors without a message so the screen shows its own text', () => {
    const original = new HttpErrorResponse({ status: 500 });
    expect(toUserFacingError(original)).toBe(original);
    expect(userFacingMessage(original, 'No pudimos guardar.')).toBe('No pudimos guardar.');
  });
});
