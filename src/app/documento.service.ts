import { Injectable, signal } from '@angular/core';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { Documento, DocumentStatus, RegistroDocumentoDto } from './models';

@Injectable({ providedIn: 'root' })
export class DocumentoService {
  readonly documents = signal<Documento[]>([
    this.seed(1001, 'F001-000184', 'Proveedor Andino SAC', 'P-1001', 'Naviera Transoceánica S.A.', 'Con Orden de Compra', 'Pendiente de contabilización', 1280, 'OC-45000123'),
    this.seed(1002, 'B001-000052', 'Proveedor Andino SAC', 'P-1001', 'Naviera Transoceánica S.A.', 'Sin Orden de Compra', 'Pendiente de aprobación', 460),
    this.seed(1003, 'E001-000091', 'Servicios Marítimos del Pacífico', 'P-2040', 'Naviera Transoceánica S.A.', 'Documento especial', 'Aprobado', 980),
    this.seed(1004, 'F001-000176', 'Proveedor Andino SAC', 'P-1001', 'Naviera Transoceánica S.A.', 'Con Orden de Compra', 'Contabilizado', 720, 'OC-45000110'),
  ]);
  private nextId = 1100;
  private seed(id: number, numero: string, proveedor: string, providerId: string, sociedad: string, tipo: Documento['tipo'], status: DocumentStatus, importe: number, oc?: string): Documento {
    const now = Date.now() - (status === 'Pendiente de aprobación' ? 45000 : 0);
    return { id, numero, proveedor, providerId, sociedad, tipo, oc, importe, fecha: '2026-05-21', aprobador: 'María Torres', status, registeredAt: now, validation: { sunat: tipo === 'Con Orden de Compra' ? 'Aprobado' : 'Pendiente', sertica: tipo === 'Con Orden de Compra' ? 'Aprobado' : 'No aplica' }, history: [{ status: 'Registrado', date: new Date(now - 8000).toISOString(), user: proveedor }, { status, date: new Date(now).toISOString(), user: 'Sistema mock' }], details: {} };
  }
  list(): Observable<Documento[]> { // TODO: reemplazar por llamada HTTP real a /api/documentos
    return of(this.documents()).pipe(delay(650));
  }
  registrarDocumento(dto: RegistroDocumentoDto): Observable<Documento> {
    const duplicate = this.documents().some((item) => item.numero === dto.numero && item.providerId === dto.providerId && item.sociedad === dto.sociedad);
    if (duplicate) return throwError(() => new Error('Ya existe un documento con el mismo número, proveedor y sociedad.')).pipe(delay(700));
    const item: Documento = { id: this.nextId++, ...dto, status: 'Registrado', registeredAt: Date.now(), validation: { sunat: 'Pendiente', sertica: 'Pendiente' }, history: [{ status: 'Registrado', date: new Date().toISOString(), user: dto.proveedor }], details: dto.details };
    this.documents.update((items) => [item, ...items]);
    // TODO: reemplazar por llamada HTTP real a /api/documentos
    if (dto.tipo === 'Con Orden de Compra') return this.validateWithOc(item);
    return this.validateWithoutOc(item, dto.validateSunat);
  }
  private validateWithOc(item: Documento): Observable<Documento> {
    this.changeStatus(item.id, 'En validación', 'Sistema mock');
    return forkJoin({ sunat: of<'Observado' | 'Aprobado'>(item.numero.includes('FAIL') ? 'Observado' : 'Aprobado').pipe(delay(900)), sertica: of<'Observado' | 'Aprobado'>(item.oc?.includes('FAIL') ? 'Observado' : 'Aprobado').pipe(delay(1200)) }).pipe(map((result) => { const ok = result.sunat === 'Aprobado' && result.sertica === 'Aprobado'; this.updateValidation(item.id, result.sunat, result.sertica); this.changeStatus(item.id, ok ? 'Pendiente de contabilización' : 'Devuelto al proveedor', 'Sistema mock', ok ? undefined : 'Falló la validación SUNAT o Sertica.'); return this.get(item.id)!; }));
  }
  private validateWithoutOc(item: Documento, validateSunat: boolean): Observable<Documento> {
    this.changeStatus(item.id, 'En validación', 'Sistema mock');
    return of<'Observado' | 'Aprobado' | 'No aplica'>(validateSunat ? (item.numero.includes('FAIL') ? 'Observado' : 'Aprobado') : 'No aplica').pipe(delay(1000), map((sunat) => { this.updateValidation(item.id, sunat, 'No aplica'); this.changeStatus(item.id, 'Pendiente de aprobación', 'Sistema mock'); return this.get(item.id)!; }));
  }
  changeStatus(id: number, status: DocumentStatus, user: string, comment?: string): void { this.documents.update((items) => items.map((item) => item.id === id ? { ...item, status, comment, history: [...item.history, { status, comment, user, date: new Date().toISOString() }] } : item)); }
  updateValidation(id: number, sunat: Documento['validation']['sunat'], sertica: Documento['validation']['sertica']): void { this.documents.update((items) => items.map((item) => item.id === id ? { ...item, validation: { ...item.validation, sunat, sertica } } : item)); }
  get(id: number): Documento | undefined { return this.documents().find((item) => item.id === id); }
  mutateForAccounting(id: number, ruta: 'SAP' | 'Sertica', numero: string): void { this.mutate(id, (item) => ({ ...item, contabilizacion: { ruta, numero } })); }
  private mutate(id: number, fn: (item: Documento) => Documento): void { this.documents.update((items) => items.map((item) => item.id === id ? fn(item) : item)); }
  approve(id: number, comment = 'Aprobado por Área Usuaria'): Observable<Documento> { this.changeStatus(id, 'Aprobado', 'Área Usuaria', comment); this.changeStatus(id, 'Pendiente de contabilización', 'Sistema mock'); return of(this.get(id)!).pipe(delay(700)); }
  reject(id: number, comment: string): Observable<Documento> { this.changeStatus(id, 'Rechazado', 'Área Usuaria', comment); return of(this.get(id)!).pipe(delay(700)); }
  markEscalated(): void { this.documents.update((items) => items.map((item) => item.status === 'Pendiente de aprobación' && !item.escalated && Date.now() - item.registeredAt > 30000 ? { ...item, escalated: true, aprobador: 'Jefatura de Área', history: [...item.history, { status: item.status, date: new Date().toISOString(), user: 'Sistema mock', comment: 'Escalamiento automático por tiempo excedido.' }] } : item)); }
}
