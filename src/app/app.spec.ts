import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { daysBetween } from './shared/ui/date-range/calendar.util';
import { normalizeRole } from './features/auth';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

describe('normalizeRole', () => {
  it('maps backend role names and codes to frontend roles', () => {
    expect(normalizeRole('Aprobador de área')).toBe('Área Usuaria');
    expect(normalizeRole('Gestor de cuentas por pagar')).toBe('CxP');
    expect(normalizeRole('ADMINISTRATOR')).toBe('Administrador');
    expect(normalizeRole('Proveedor')).toBe('Proveedor');
    expect(normalizeRole('desconocido')).toBeNull();
  });
});

describe('daysBetween', () => {
  it('counts both ends of the range, across months', () => {
    expect(daysBetween('2026-10-06', '2026-10-06')).toBe(1);
    expect(daysBetween('2026-09-09', '2026-09-18')).toBe(10);
    expect(daysBetween('2026-09-30', '2026-10-06')).toBe(7);
  });
});
