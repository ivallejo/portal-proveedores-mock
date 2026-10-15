import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FocusTrapDirective } from './focus-trap.directive';

@Component({
  imports: [FocusTrapDirective],
  template: `
    <button id="opener" type="button">Abrir</button>
    @if (open()) {
      <div appFocusTrap id="panel">
        <button id="first" type="button">Primero</button>
        <button id="last" type="button">Último</button>
      </div>
    }
  `,
})
class HostComponent {
  readonly open = signal(false);
}

describe('FocusTrapDirective', () => {
  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    (el.querySelector('#opener') as HTMLButtonElement).focus();
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    return { fixture, el };
  }

  function tab(target: Element, shiftKey = false): void {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true }));
  }

  it('lleva el foco al panel al abrirse', async () => {
    const { fixture, el } = setup();
    await fixture.whenStable();
    expect(document.activeElement).toBe(el.querySelector('#panel'));
    fixture.nativeElement.remove();
  });

  it('mantiene Tab y Shift+Tab dentro del panel', async () => {
    const { fixture, el } = setup();
    await fixture.whenStable();
    const first = el.querySelector('#first') as HTMLButtonElement;
    const last = el.querySelector('#last') as HTMLButtonElement;

    last.focus();
    tab(last);
    expect(document.activeElement).toBe(first);

    tab(first, true);
    expect(document.activeElement).toBe(last);
    fixture.nativeElement.remove();
  });

  it('devuelve el foco al elemento que abrió el panel', async () => {
    const { fixture, el } = setup();
    await fixture.whenStable();
    fixture.componentInstance.open.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(el.querySelector('#opener'));
    fixture.nativeElement.remove();
  });
});
