import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let toast: ToastService;

  beforeEach(() => (toast = TestBed.inject(ToastService)));

  it('dura al menos 4 s aunque se pida menos', fakeAsync(() => {
    toast.show('Guardado', 1000);
    tick(3900);
    expect(toast.current()?.message).toBe('Guardado');
    tick(200);
    expect(toast.current()).toBeNull();
  }));

  it('alarga la duración con mensajes largos, hasta 10 s', fakeAsync(() => {
    toast.show('x'.repeat(500));
    tick(9900);
    expect(toast.current()).not.toBeNull();
    tick(200);
    expect(toast.current()).toBeNull();
  }));

  it('guarda el tono y ejecuta la acción al pulsarla', fakeAsync(() => {
    const run = jasmine.createSpy('run');
    toast.show('No pudimos guardar', { tone: 'error', action: { label: 'Reintentar', run } });
    expect(toast.current()?.tone).toBe('error');

    toast.runAction();
    expect(run).toHaveBeenCalled();
    expect(toast.current()).toBeNull();
  }));
});
