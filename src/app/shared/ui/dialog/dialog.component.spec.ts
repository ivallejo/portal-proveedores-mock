import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DialogComponent } from './dialog.component';

@Component({
  imports: [DialogComponent],
  template: `
    @if (open()) {
      <app-dialog heading="Detalle" (closed)="open.set(false)">Contenido</app-dialog>
    }
  `,
})
class HostComponent {
  readonly open = signal(true);
}

describe('DialogComponent', () => {
  // TestBed desactiva las animaciones por defecto; aquí se prueba justamente la salida animada.
  beforeEach(() => TestBed.configureTestingModule({ animationsEnabled: true }));

  it('espera la salida animada antes de retirarse del DOM', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.open.set(false);
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 20));
    const leaving = fixture.nativeElement.querySelector('app-dialog');
    expect(leaving?.classList).toContain('animate-leave');

    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(fixture.nativeElement.querySelector('app-dialog')).toBeNull();
    fixture.nativeElement.remove();
  });

  it('se cierra con Escape', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(fixture.componentInstance.open()).toBeFalse();
  });
});
