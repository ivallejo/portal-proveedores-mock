import { Injectable, inject, signal } from '@angular/core';
import { AprobacionService } from '../services/aprobacion.service';
import { DocumentoService } from '../../documents/services/documento.service';
import { NavigationService } from '../../../core/navigation/navigation.service';

@Injectable({ providedIn: 'root' })
export class ApprovalsFacade {
  readonly aprobacionService = inject(AprobacionService);
  private readonly documentos = inject(DocumentoService);
  readonly screen = inject(NavigationService).screen;
  readonly loading = signal(false);
  readonly message = signal('');
  readonly error = signal('');
  readonly approvalItems = signal(
    this.documentos.documents().filter((item) => item.status === 'Pendiente de aprobación'),
  );
  readonly approvalComment = signal<Record<number, string>>({});
  readonly approvalTarget = signal<Record<number, string>>({});

  load(): void {
    this.loading.set(true);
    this.aprobacionService.pendientes().subscribe((items) => {
      this.approvalItems.set(items);
      this.loading.set(false);
    });
  }
  approve(id: number): void {
    this.loading.set(true);
    this.aprobacionService.aprobar(id).subscribe((item) => {
      this.loading.set(false);
      this.message.set(`Documento ${item.numero} aprobado y enviado a contabilización.`);
      this.load();
    });
  }
  reject(id: number): void {
    const comment = this.approvalComment()[id]?.trim();
    if (!comment) {
      this.error.set('El comentario es obligatorio para rechazar.');
      return;
    }
    this.loading.set(true);
    this.aprobacionService.rechazar(id, comment).subscribe((item) => {
      this.loading.set(false);
      this.message.set(`Documento ${item.numero} rechazado.`);
      this.load();
    });
  }
  derive(id: number): void {
    const target = this.approvalTarget()[id]?.trim();
    if (!target) {
      this.error.set('Selecciona el aprobador al que se derivará el documento.');
      return;
    }
    this.loading.set(true);
    this.aprobacionService.derivar(id, target).subscribe((item) => {
      this.loading.set(false);
      this.message.set(`Documento ${item.numero} derivado a ${target}.`);
      this.load();
    });
  }
  setComment(id: number, value: string): void {
    this.approvalComment.update((values) => ({ ...values, [id]: value }));
  }
  setApprovalTarget(id: number, value: string): void {
    this.approvalTarget.update((values) => ({ ...values, [id]: value }));
  }
}
