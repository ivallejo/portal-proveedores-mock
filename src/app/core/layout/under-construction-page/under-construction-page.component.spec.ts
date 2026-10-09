import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { UnderConstructionPageComponent } from './under-construction-page.component';

describe('UnderConstructionPageComponent', () => {
  it('muestra el título de la ruta y el enlace a Inicio', () => {
    TestBed.configureTestingModule({
      imports: [UnderConstructionPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { data: { title: 'Reportes' } } } },
      ],
    });
    const fixture = TestBed.createComponent(UnderConstructionPageComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Reportes');
    expect(text).toContain('Esta sección está en construcción');
    expect(fixture.nativeElement.querySelector('a').getAttribute('href')).toBe('/inicio');
  });
});
