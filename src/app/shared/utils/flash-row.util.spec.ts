import { fakeAsync, tick } from '@angular/core/testing';
import { signal } from '@angular/core';
import { flashRow } from './flash-row.util';

describe('flashRow', () => {
  it('marca la fila y la desmarca al terminar', fakeAsync(() => {
    const flashed = signal<string | null>(null);
    flashRow(flashed, 'a1', 1000);
    expect(flashed()).toBe('a1');
    tick(1000);
    expect(flashed()).toBeNull();
  }));

  it('no borra una fila marcada después', fakeAsync(() => {
    const flashed = signal<string | null>(null);
    flashRow(flashed, 'a1', 1000);
    tick(500);
    flashRow(flashed, 'a2', 1000);
    tick(500);
    expect(flashed()).toBe('a2');
    tick(500);
    expect(flashed()).toBeNull();
  }));
});
