import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UserFacingError } from '../../shared/errors/user-facing-error';
import { toUserFacingBlobError } from './to-user-facing-blob-error';

describe('toUserFacingBlobError', () => {
  it('lee el mensaje del backend que llega como Blob', async () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: new Blob([
        JSON.stringify({ message: 'El rango de fechas no puede superar 1 mes (31 días).' }),
      ]),
    });
    const result = await firstValueFrom(toUserFacingBlobError(error)).catch((e: unknown) => e);
    expect(result).toEqual(jasmine.any(UserFacingError));
    expect((result as UserFacingError).message).toBe(
      'El rango de fechas no puede superar 1 mes (31 días).',
    );
  });
});
