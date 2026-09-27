import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Documento } from './models';
import { DocumentoService } from './documento.service';

export interface Incidencia {
  id: number;
  documento: Documento;
  mensaje: string;
  fecha: string;
  ruta: 'SAP' | 'Sertica';
}

@Injectable({ providedIn: 'root' })
export class ContabilizacionService {
  private readonly documentos = inject(DocumentoService);
  readonly incidencias = signal<Incidencia[]>([]);
  ejecutarJobDiario(): Observable<void> {
    return of(undefined).pipe(
      delay(700),
      tap(() => {
        this.documentos
          .documents()
          .filter((item) => item.status === 'Pendiente de contabilización')
          .forEach((item) => {
            const numero = `5100${Math.floor(100000 + Math.random() * 899999)}`;
            this.documentos.changeStatus(item.id, 'Contabilizado', 'Job automático SAP');
            this.documentos.mutateForAccounting(item.id, 'SAP', numero);
          });
      }),
    );
  }
  contabilizados(sociedad = '', tipo = ''): Observable<Documento[]> {
    // TODO: reemplazar por consulta real de documentos contabilizados.
    const result = this.documentos
      .documents()
      .filter(
        (item) =>
          item.status === 'Contabilizado' &&
          (!sociedad || item.sociedad === sociedad) &&
          (!tipo || item.tipo === tipo),
      );
    return of(result).pipe(delay(700));
  }
  reenviarAnexos(id: number): Observable<Documento> {
    // El reenvío es solo de salida y no modifica el estado web.
    return of(this.documentos.get(id)!).pipe(delay(700));
  }
}
