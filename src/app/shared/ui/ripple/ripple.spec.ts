import { TestBed } from '@angular/core/testing';
import { Ripple } from './ripple';

describe('Ripple', () => {
  let host: HTMLButtonElement;

  beforeAll(() => TestBed.inject(Ripple).listen());

  beforeEach(() => {
    host = document.createElement('button');
    host.className = 'btn';
    host.style.width = '120px';
    host.style.height = '40px';
    document.body.appendChild(host);
  });

  afterEach(() => host.remove());

  function press(target: Element, init: PointerEventInit = {}): void {
    const rect = target.getBoundingClientRect();
    target.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        button: 0,
        clientX: rect.left + 10,
        clientY: rect.top + 10,
        ...init,
      }),
    );
  }

  it('crea una onda dentro del botón al pulsarlo', () => {
    press(host);

    const wave = host.querySelector('.ripple-container > .ripple-wave');
    expect(wave).not.toBeNull();
    expect(wave?.classList).toContain('ripple-wave-active');
    expect(host.style.position).toBe('relative');
  });

  it('reutiliza el contenedor en pulsaciones seguidas', () => {
    press(host);
    press(host);

    expect(host.querySelectorAll('.ripple-container').length).toBe(1);
    expect(host.querySelectorAll('.ripple-wave').length).toBe(2);
  });

  it('no actúa en botones deshabilitados ni con el botón secundario', () => {
    press(host, { button: 2 });
    host.disabled = true;
    press(host);

    expect(host.querySelector('.ripple-container')).toBeNull();
  });

  it('ignora elementos que no son `.btn` ni `.ripple`', () => {
    host.className = '';
    press(host);

    expect(host.querySelector('.ripple-container')).toBeNull();
  });
});
