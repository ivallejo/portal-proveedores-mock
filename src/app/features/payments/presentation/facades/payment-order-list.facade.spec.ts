import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UserFacingError } from '../../../../shared/errors/user-facing-error';
import { SEARCH_PAYMENT_ORDERS } from '../../di/payments.tokens';
import { PaymentOrder } from '../../domain/models/payment-order';
import { PaymentOrderListFacade } from './payment-order-list.facade';
import { SupplierScopeFacade } from './supplier-scope.facade';

describe('PaymentOrderListFacade', () => {
  let search: jasmine.Spy;

  function setup(isProvider: boolean): PaymentOrderListFacade {
    search = jasmine
      .createSpy('search')
      .and.returnValue(
        of([{ currency: 'PEN', total: 150, documents: [] } as unknown as PaymentOrder]),
      );
    TestBed.configureTestingModule({
      providers: [
        PaymentOrderListFacade,
        { provide: SEARCH_PAYMENT_ORDERS, useValue: { execute: search } },
        {
          provide: SupplierScopeFacade,
          useValue: {
            isProvider: () => isProvider,
            companyOptions: () => () => [],
            defaultPeriod: () => ({ from: '2026-07-09', to: '2026-10-09' }),
            missingRuc: (ruc: string) =>
              isProvider || ruc.length === 11 ? '' : 'Ingresa el RUC del proveedor (11 dígitos).',
          },
        },
      ],
    });
    return TestBed.inject(PaymentOrderListFacade);
  }

  it('el proveedor consulta al entrar y ve los totales', () => {
    const facade = setup(true);
    facade.start();
    expect(search).toHaveBeenCalledWith({
      ruc: '',
      company: '',
      from: '2026-07-09',
      to: '2026-10-09',
    });
    expect(facade.kpis().count).toBe('1');
    expect(facade.searched()).toBeTrue();
  });

  it('CxP debe indicar el RUC antes de consultar', () => {
    const facade = setup(false);
    facade.start();
    expect(search).not.toHaveBeenCalled();
    facade.search();
    expect(facade.error()).toContain('11 dígitos');
    facade.setFilter('ruc', '20123456789');
    facade.search();
    expect(search).toHaveBeenCalledTimes(1);
    expect(facade.error()).toBe('');
  });

  it('muestra el mensaje del backend si SAP falla', () => {
    const facade = setup(true);
    search.and.returnValue(throwError(() => new UserFacingError('SAP no responde.')));
    facade.search();
    expect(facade.error()).toBe('SAP no responde.');
    expect(facade.orders()).toEqual([]);
  });
});
