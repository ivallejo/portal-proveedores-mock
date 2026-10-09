import { passwordRules } from './password-rules';

describe('passwordRules', () => {
  it('checks length, uppercase, lowercase and a digit', () => {
    expect(passwordRules('abc').map((rule) => rule.ok)).toEqual([false, false, true, false]);
    expect(passwordRules('Clave2026').every((rule) => rule.ok)).toBeTrue();
  });
});
