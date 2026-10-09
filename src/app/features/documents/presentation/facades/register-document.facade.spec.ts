import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { SessionFacade } from '../../../auth';
import { CatalogFacade } from '../../../catalog';
import {
  READ_ELECTRONIC_DOCUMENT,
  REGISTER_ELECTRONIC_DOCUMENT,
  REGISTER_SPECIAL_DOCUMENT,
  VALIDATE_PURCHASE_ORDER,
} from '../../di/documents.tokens';
import { DocumentRejectedError } from '../../domain/errors/document-rejected.error';
import { RegisterDocumentFacade } from './register-document.facade';

describe('RegisterDocumentFacade', () => {
  let registerSpecial: jasmine.Spy;
  let validate: jasmine.Spy;

  function setup(roles: string[]): RegisterDocumentFacade {
    registerSpecial = jasmine.createSpy('registerSpecial');
    validate = jasmine.createSpy('validate').and.returnValue(of(null));
    TestBed.configureTestingModule({
      providers: [
        RegisterDocumentFacade,
        { provide: ToastService, useValue: { show: () => undefined } },
        {
          provide: SessionFacade,
          useValue: { user: () => ({ roles, name: 'Ana' }), isAdmin: () => false },
        },
        {
          provide: CatalogFacade,
          useValue: {
            companyOptions: () => [],
            company: () => ({ name: 'Naviera', billingEmail: null }),
            areaOptionsFor: () => [],
            approverOptions: () => [],
            approvers: () => [],
            load: () => undefined,
          },
        },
        { provide: VALIDATE_PURCHASE_ORDER, useValue: { execute: validate } },
        { provide: READ_ELECTRONIC_DOCUMENT, useValue: { execute: () => Promise.resolve(null) } },
        { provide: REGISTER_ELECTRONIC_DOCUMENT, useValue: { execute: () => of(null) } },
        { provide: REGISTER_SPECIAL_DOCUMENT, useValue: { execute: registerSpecial } },
      ],
    });
    return TestBed.inject(RegisterDocumentFacade);
  }

  it('solo el personal interno ve los documentos especiales y la Caja Chica', () => {
    expect(
      setup(['Proveedor'])
        .entryCards()
        .map((card) => card.value),
    ).toEqual(['oc', 'sin']);
    TestBed.resetTestingModule();
    const internal = setup(['Colaborador interno']);
    expect(internal.entryCards().length).toBe(3);
    expect(internal.canPettyCash()).toBeTrue();
  });

  it('una orden que SAP no reconoce queda marcada', () => {
    const facade = setup(['Proveedor']);
    facade.validateOrder();
    expect(facade.formError()).toContain('Selecciona la sociedad');
    facade.setCompany('1001');
    facade.setOrderNumber('4500001');
    facade.validateOrder();
    expect(validate).toHaveBeenCalledWith('1001', 'Servicio', '4500001');
    expect(facade.orderState()).toBe('bad');
  });

  it('no deja avanzar sin los datos y archivos requeridos', () => {
    const facade = setup(['Proveedor']);
    facade.next();
    expect(facade.formError()).toBe('Falta: sociedad, orden validada, archivos requeridos.');
    expect(facade.step()).toBe(1);
  });

  it('muestra el rechazo de SAP como resultado del documento especial', () => {
    const facade = setup(['Colaborador interno']);
    facade.pickEntry('esp');
    facade.next();
    expect(facade.formError()).toContain('Completa la sociedad');
    expect(registerSpecial).not.toHaveBeenCalled();

    facade.setCompany('1001');
    facade.setSpecial('ruc', '20512345678');
    facade.setSpecial('date', '2026-10-01');
    facade.setSpecial('number', 'bt-1');
    facade.setSpecial('amount', '1,250.50');
    facade.slots.update((slots) => ({
      ...slots,
      pdf: {
        state: 'ok',
        file: new File(['x'], 'bt.pdf'),
        name: 'bt.pdf',
        size: '1 KB',
        error: '',
      },
    }));
    registerSpecial.and.returnValue(
      throwError(() => new DocumentRejectedError('El documento ya está registrado en SAP.')),
    );
    facade.next();
    expect(registerSpecial.calls.mostRecent().args[0]).toEqual(
      jasmine.objectContaining({ number: 'bt-1', amount: 1250.5, type: 'Boleto aéreo' }),
    );
    expect(facade.result()?.ok).toBeFalse();
    expect(facade.result()?.text).toBe('El documento ya está registrado en SAP.');
  });
});
