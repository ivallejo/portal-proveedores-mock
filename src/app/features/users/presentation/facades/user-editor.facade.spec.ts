import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import {
  CHANGE_USER_STATUS,
  GET_PASSWORD_LINKS,
  GET_USER,
  GET_USER_CATALOG,
  SAVE_USER,
  SEARCH_USERS,
  SEND_PASSWORD_LINK,
} from '../../di/users.tokens';
import { UserCatalog } from '../../domain/models/user-catalog';
import { UserEditorFacade } from './user-editor.facade';
import { UserListFacade } from './user-list.facade';

const catalog: UserCatalog = {
  roles: [
    { code: 'PROVIDER', name: 'Proveedor', description: null, isProvider: true, isActive: true },
    {
      code: 'AREA_APPROVER',
      name: 'Aprobador',
      description: null,
      isProvider: false,
      isActive: true,
    },
  ],
  areas: [
    { id: 'a1', name: 'Compras', companyCode: '1001', companyName: 'Naviera', isActive: true },
  ],
  companies: [{ code: '1001', name: 'Naviera', ruc: null, isActive: true }],
};

describe('UserEditorFacade', () => {
  let save: jasmine.Spy;

  function setup(): UserEditorFacade {
    save = jasmine
      .createSpy('save')
      .and.returnValue(
        of({ displayName: 'Ana Pérez', emails: [{ email: 'ana@b.pe', isPrimary: true }] }),
      );
    TestBed.configureTestingModule({
      providers: [
        UserListFacade,
        UserEditorFacade,
        { provide: GET_USER_CATALOG, useValue: { execute: () => of(catalog) } },
        {
          provide: SEARCH_USERS,
          useValue: {
            execute: () =>
              of({
                items: [],
                total: 0,
                page: 1,
                pageSize: 10,
                counts: { total: 0, active: 0, blockedOrInactive: 0 },
              }),
          },
        },
        { provide: CHANGE_USER_STATUS, useValue: { execute: () => of() } },
        { provide: GET_USER, useValue: { execute: () => of() } },
        { provide: SAVE_USER, useValue: { execute: save } },
        { provide: SEND_PASSWORD_LINK, useValue: { execute: () => of() } },
        { provide: GET_PASSWORD_LINKS, useValue: { execute: () => of([]) } },
        { provide: ToastService, useValue: { show: () => undefined } },
      ],
    });
    TestBed.inject(UserListFacade).loadCatalog();
    return TestBed.inject(UserEditorFacade);
  }

  it('jumps to the first tab with problems and does not save', () => {
    const editor = setup();
    editor.openNew();
    editor.setField('role', 'AREA_APPROVER');
    editor.setField('document', '40000001');
    editor.setField('firstName', 'Ana');
    editor.setField('lastName', 'Pérez');
    editor.setField('areaId', 'a1');
    editor.selectTab('socs');
    editor.save();
    expect(save).not.toHaveBeenCalled();
    expect(editor.tab()).toBe('correos');
    expect(editor.footerError()).toBe('Agrega al menos un correo en la pestaña Correos.');
  });

  it('sends only the data of an internal user when it is valid', () => {
    const editor = setup();
    editor.openNew();
    editor.setField('role', 'AREA_APPROVER');
    editor.setField('document', '40000001');
    editor.setField('firstName', 'Ana');
    editor.setField('lastName', 'Pérez');
    editor.setField('areaId', 'a1');
    editor.newEmail.set('ana@b.pe');
    editor.addEmail();
    editor.toggleCompany('1001');
    editor.save();
    expect(save).toHaveBeenCalledOnceWith(
      null,
      jasmine.objectContaining({
        role: 'AREA_APPROVER',
        document: '40000001',
        businessName: undefined,
        firstName: 'Ana',
        areaId: 'a1',
        companyCodes: ['1001'],
        emails: [{ id: undefined, email: 'ana@b.pe', type: 'work', isPrimary: true }],
      }),
    );
  });

  it('switching between provider and internal role clears the identity data', () => {
    const editor = setup();
    editor.openNew();
    editor.setField('role', 'PROVIDER');
    editor.setField('document', '20100126606');
    editor.setField('businessName', 'Petrolera');
    editor.setField('role', 'AREA_APPROVER');
    expect(editor.form()).toEqual(jasmine.objectContaining({ document: '', businessName: '' }));
  });
});
