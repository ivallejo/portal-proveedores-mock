import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import {
  DOWNLOAD_ATTACHMENT,
  GET_DOCUMENT,
  OBSERVE_DOCUMENT,
  REJECT_DOCUMENT,
  SEARCH_DOCUMENT_INBOX,
} from '../../di/documents.tokens';
import { PortalDocument } from '../../domain/models/portal-document';
import { AccountingInboxFacade } from './accounting-inbox.facade';

const doc = {
  id: 'd1',
  number: 'F001-1',
  providerName: 'Andes',
  providerEmail: 'andes@b.pe',
  status: 'Pendiente de contabilización',
  entryType: 'Sin OC',
} as PortalDocument;

describe('AccountingInboxFacade', () => {
  let search: jasmine.Spy;
  let observe: jasmine.Spy;

  function setup(): AccountingInboxFacade {
    search = jasmine.createSpy('search').and.returnValue(of([doc]));
    observe = jasmine.createSpy('observe').and.returnValue(of({ ...doc, status: 'Observado' }));
    TestBed.configureTestingModule({
      providers: [
        AccountingInboxFacade,
        { provide: ToastService, useValue: { show: () => undefined } },
        { provide: SEARCH_DOCUMENT_INBOX, useValue: { execute: search } },
        { provide: GET_DOCUMENT, useValue: { execute: () => of(doc) } },
        { provide: DOWNLOAD_ATTACHMENT, useValue: { execute: () => of(new Blob()) } },
        { provide: REJECT_DOCUMENT, useValue: { execute: () => of(doc) } },
        { provide: OBSERVE_DOCUMENT, useValue: { execute: observe } },
      ],
    });
    const facade = TestBed.inject(AccountingInboxFacade);
    facade.start();
    return facade;
  }

  it('consulta su bandeja y cuenta por estado', () => {
    const facade = setup();
    expect(search).toHaveBeenCalledWith('Accounting', { ruc: '', status: '' });
    expect(facade.kpis().pending).toBe('1');
    expect(facade.rowCaption(doc)).toBe('Andes · Aprobó —');
  });

  it('observa con el correo del proveedor y muestra el resultado', () => {
    const facade = setup();
    facade.open(doc);
    facade.openPanel('observe');
    expect(facade.email()).toBe('andes@b.pe');
    facade.observe();
    expect(facade.panelError()).toBe('Ingresa el motivo de la observación.');
    facade.reason.set('Falta la guía de remisión');
    facade.observe();
    expect(observe).toHaveBeenCalledWith('d1', 'Falta la guía de remisión', 'andes@b.pe');
    expect(facade.result()?.kind).toBe('warn');
    expect(facade.panel()).toBeNull();
    expect(search).toHaveBeenCalledTimes(2);
  });
});
