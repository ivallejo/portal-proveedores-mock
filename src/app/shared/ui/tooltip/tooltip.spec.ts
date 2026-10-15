import { TestBed } from '@angular/core/testing';
import { Tooltip } from './tooltip';

describe('Tooltip', () => {
  let target: HTMLButtonElement;

  beforeAll(() => TestBed.inject(Tooltip).listen());

  beforeEach(() => {
    target = document.createElement('button');
    target.dataset['tooltip'] = 'Editar usuario';
    target.textContent = 'E';
    document.body.appendChild(target);
  });

  afterEach(() => {
    target.dispatchEvent(new PointerEvent('pointerout', { bubbles: true, pointerType: 'mouse' }));
    target.remove();
  });

  const tip = () => document.getElementById('app-tooltip');

  it('aparece tras el retraso al pasar el cursor y describe al elemento', async () => {
    target.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' }));
    expect(tip()?.hidden ?? true).toBeTrue();

    await new Promise((resolve) => setTimeout(resolve, 550));
    expect(tip()?.hidden).toBeFalse();
    expect(tip()?.textContent).toBe('Editar usuario');
    expect(target.getAttribute('aria-describedby')).toBe('app-tooltip');
  });

  it('se oculta al salir y con Escape', async () => {
    target.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' }));
    await new Promise((resolve) => setTimeout(resolve, 550));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(tip()?.hidden).toBeTrue();
    expect(target.hasAttribute('aria-describedby')).toBeFalse();
  });

  it('no aparece con toques en pantallas táctiles', async () => {
    target.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'touch' }));
    await new Promise((resolve) => setTimeout(resolve, 550));
    expect(tip()?.hidden ?? true).toBeTrue();
  });
});
