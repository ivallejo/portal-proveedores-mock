import { tokenExpiresAt } from './token-rules';

const jwt = (payload: object) =>
  `x.${btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}.y`;

describe('tokenExpiresAt', () => {
  it('lee el vencimiento del token', () => {
    expect(tokenExpiresAt(jwt({ exp: 1_800_000_000, sub: 'ñandú' }))).toBe(1_800_000_000_000);
  });

  it('devuelve vacío si el token no es legible', () => {
    expect(tokenExpiresAt('no-es-un-jwt')).toBeNull();
    expect(tokenExpiresAt(jwt({ sub: 'x' }))).toBeNull();
  });
});
