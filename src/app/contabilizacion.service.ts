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
  pendientes(sociedad = '', tipo = ''): Observable<Documento[]> {
    // TODO: reemplazar por llamada HTTP real a /api/contabilizacion/pendientes
    const result = this.documentos
      .documents()
      .filter(
        (item) =>
          item.status === 'Pendiente de contabilización' &&
          (!sociedad || item.sociedad === sociedad) &&
          (!tipo || item.tipo === tipo),
      );
    return of(result).pipe(delay(700));
  }
  contabilizar(id: number, ruta: 'SAP' | 'Sertica'): Observable<Documento> {
    // TODO: reemplazar por llamada HTTP real a /api/contabilizacion/{id}
    const documento = this.documentos.get(id)!;
    const fails = documento.numero.includes('FAIL') || documento.id % 5 === 0;
    return of(documento).pipe(
      delay(1100),
      tap(() => {
        if (fails) {
          this.incidencias.update((items) => [
            {
              id: Date.now(),
              documento,
              ruta,
              fecha: new Date().toISOString(),
              mensaje: `No fue posible contabilizar en ${ruta}. Error de conexión simulado.`,
            },
            ...items,
          ]);
          return;
        }
        const numero =
          ruta === 'SAP'
            ? `5100${Math.floor(100000 + Math.random() * 899999)}`
            : `SER-${Math.floor(10000 + Math.random() * 89999)}`;
        this.documentos.changeStatus(id, 'Contabilizado', 'CxP', `Contabilizado vía ${ruta}`);
        this.documentos.mutateForAccounting(id, ruta, numero);
      }),
    );
  }
  retry(id: number, ruta: 'SAP' | 'Sertica'): Observable<Documento> {
    // TODO: reemplazar por llamada HTTP real a /api/contabilizacion/incidencias/{id}/reintentar
    return this.contabilizar(id, ruta);
  }
}
