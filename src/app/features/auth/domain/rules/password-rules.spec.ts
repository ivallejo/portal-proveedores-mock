import { passwordRules } from './password-rules';

describe('passwordRules', () => {
  const ok = (value: string, personalData: string[] = []) =>
    passwordRules(value, personalData).map((rule) => rule.ok);

  it('exige 12 caracteres y 3 de 4 tipos', () => {
    expect(ok('Brisa#2027')).toEqual([false, true]);
    expect(ok('brisamarina2027')).toEqual([true, false]);
    expect(ok('brisa marina 2027')).toEqual([true, true]);
    expect(ok('Lunes#Brisa2027')).toEqual([true, true]);
  });

  it('muestra la regla de datos personales solo si los hay', () => {
    expect(passwordRules('Lunes#Brisa2027').length).toBe(2);
    const maria = ['maria.torres', 'María José Torres Ñahui'];
    expect(ok('Lunes#Brisa2027', maria)).toEqual([true, true, true]);
    expect(ok('Maria#Lunes2027', maria)).toEqual([true, true, false]);
    expect(ok('Lunes#ÑAHUI2027', maria)).toEqual([true, true, false]);
  });

  it('ignora palabras cortas y sufijos legales de la razón social', () => {
    const saga = ['20100128056', 'Saga Falabella S.A.C.'];
    expect(ok('Sac#Del#Lunes27', saga)).toEqual([true, true, true]);
    expect(ok('Falabella#2027', saga)).toEqual([true, true, false]);
  });
});
