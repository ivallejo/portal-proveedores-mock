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

  it('Con OC es del proveedor y los especiales del personal interno (flujos 01 y 03)', () => {
    expect(
      setup(['Proveedor'])
        .entryCards()
        .map((card) => card.value),
    ).toEqual(['oc', 'sin']);
    TestBed.resetTestingModule();
    const internal = setup(['Colaborador interno']);
    expect(internal.entryCards().map((card) => card.value)).toEqual(['sin', 'esp']);
    internal.start();
    expect(internal.entry()).toBe('sin');
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

  it('no registra sin los datos y archivos requeridos y dice qué falta', () => {
    const facade = setup(['Proveedor']);
    expect(facade.statusText()).toBe('Faltan 5 pasos');
    expect(facade.filesProgress()).toBe('0 de 3');
    facade.register();
    expect(facade.formError()).toBe(
      'Falta completar: sociedad, orden validada, XML, PDF, CDR de SUNAT.',
    );
    expect(facade.result()).toBeNull();
  });

  it('Sin OC: el proveedor elige aprobador y el interno va directo a contabilización (flujo 02)', () => {
    const provider = setup(['Proveedor']);
    provider.pickEntry('sin');
    expect(provider.checks().map((check) => check.label)).toContain('Área y aprobador');
    expect(provider.statusOnRegister()).toBe('Pendiente de aprobación');
    TestBed.resetTestingModule();
    const internal = setup(['Colaborador interno']);
    internal.pickEntry('sin');
    expect(internal.checks().map((check) => check.label)).not.toContain('Área y aprobador');
    expect(internal.statusOnRegister()).toBe('Pendiente de contabilización');
  });

  it('muestra el rechazo de SAP como resultado del documento especial', () => {
    const facade = setup(['Colaborador interno']);
    facade.pickEntry('esp');
    facade.register();
    expect(facade.formError()).toBe('Falta completar: sociedad, datos del documento, PDF.');
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
    expect(facade.ready()).toBeTrue();
    facade.register();
    expect(registerSpecial.calls.mostRecent().args[0]).toEqual(
      jasmine.objectContaining({ number: 'bt-1', amount: 1250.5, type: 'Boleto aéreo' }),
    );
    expect(facade.result()?.ok).toBeFalse();
    expect(facade.result()?.text).toBe('El documento ya está registrado en SAP.');

    // «Corregir y reintentar» vuelve al formulario con los mismos datos.
    facade.retry();
    expect(facade.result()).toBeNull();
    expect(facade.special().number).toBe('bt-1');
  });
});
