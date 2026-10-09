import { of } from 'rxjs';
import { ElectronicDocument } from '../../domain/models/electronic-document';
import { ReadElectronicDocumentUseCase } from './read-electronic-document.use-case';
import { RejectDocumentUseCase } from './reject-document.use-case';

const context = {
  entry: 'Con OC' as const,
  issuerName: '',
  issuerRuc: '',
  receiverName: '',
  receiverRuc: '',
};

describe('documents use cases', () => {
  it('usa el XML leído y, si no es UBL o falla, un comprobante de ejemplo', async () => {
    const parsed = { number: 'F001-1', fromXml: true } as ElectronicDocument;
    const file = new File(['<x/>'], 'F002-00000010.xml');
    const read = jasmine.createSpy('read').and.resolveTo(parsed);
    const useCase = new ReadElectronicDocumentUseCase({ read });
    expect(await useCase.execute(file, context)).toBe(parsed);

    read.and.resolveTo(null);
    expect((await useCase.execute(file, context)).number).toBe('F002-00000010');
    read.and.rejectWith(new Error('ilegible'));
    expect((await useCase.execute(file, context)).fromXml).toBeFalse();
  });

  it('el rechazo va al aprobador o a Cuentas por pagar según la etapa', () => {
    const approval = jasmine.createSpyObj('approval', ['approve', 'reassign', 'reject']);
    const accounting = jasmine.createSpyObj('accounting', ['reject', 'observe']);
    approval.reject.and.returnValue(of(null));
    accounting.reject.and.returnValue(of(null));
    const useCase = new RejectDocumentUseCase(approval, accounting);
    useCase.execute('d1', 'motivo', 'aprobador');
    useCase.execute('d2', 'motivo', 'contabilidad');
    expect(approval.reject).toHaveBeenCalledOnceWith('d1', 'motivo');
    expect(accounting.reject).toHaveBeenCalledOnceWith('d2', 'motivo');
  });
});
