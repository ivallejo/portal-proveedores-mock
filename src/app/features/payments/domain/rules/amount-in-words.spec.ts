import { amountInWords } from './amount-in-words';

describe('amountInWords', () => {
  it('escribe el importe del prototipo', () => {
    expect(amountInWords(19584.78, 'PEN')).toBe(
      'DIECINUEVE MIL QUINIENTOS OCHENTA Y CUATRO Y 78/100 SOLES',
    );
  });

  it('maneja cien, mil, un millón y la apócope de «uno»', () => {
    expect(amountInWords(100, 'PEN')).toBe('CIEN Y 00/100 SOLES');
    expect(amountInWords(101, 'PEN')).toBe('CIENTO UNO Y 00/100 SOLES');
    expect(amountInWords(1000, 'PEN')).toBe('MIL Y 00/100 SOLES');
    expect(amountInWords(21000, 'PEN')).toBe('VEINTIÚN MIL Y 00/100 SOLES');
    expect(amountInWords(31_000, 'PEN')).toBe('TREINTA Y UN MIL Y 00/100 SOLES');
    expect(amountInWords(1_000_000, 'USD')).toBe('UN MILLÓN Y 00/100 DÓLARES AMERICANOS');
    expect(amountInWords(2_500_001.5, 'USD')).toBe(
      'DOS MILLONES QUINIENTOS MIL UNO Y 50/100 DÓLARES AMERICANOS',
    );
  });

  it('redondea los céntimos y acepta cero', () => {
    expect(amountInWords(0, 'PEN')).toBe('CERO Y 00/100 SOLES');
    expect(amountInWords(12.345, 'PEN')).toBe('DOCE Y 35/100 SOLES');
  });
});
