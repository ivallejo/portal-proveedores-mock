import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Documento } from './models';
import { DocumentoService } from './documento.service';

@Injectable({ providedIn: 'root' })
export class AprobacionService {
  private readonly documentos = inject(DocumentoService);
  pendientes(): Observable<Documento[]> { this.documentos.markEscalated(); // TODO: reemplazar por llamada HTTP real a /api/aprobaciones/pendientes
    return of(this.documentos.documents().filter((item) => item.status === 'Pendiente de aprobación')).pipe(delay(700)); }
  aprobar(id: number): Observable<Documento> { // TODO: reemplazar por llamada HTTP real a /api/aprobaciones/{id}/aprobar
    return this.documentos.approve(id); }
  rechazar(id: number, comentario: string): Observable<Documento> { // TODO: reemplazar por llamada HTTP real a /api/aprobaciones/{id}/rechazar
    return this.documentos.reject(id, comentario); }
}
