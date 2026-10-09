import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { GET_SOCIETIES, Society } from '../../../societies';
import { SocietyLookupAdapter } from './society-lookup.adapter';

describe('SocietyLookupAdapter', () => {
  it('keeps only what Areas needs from the societies feature', async () => {
    const society: Society = {
      id: 's1',
      code: '1001',
      name: 'Naviera',
      ruc: '20522163890',
      billingEmail: 'a@b.pe',
      isActive: true,
      areaCount: 5,
      userCount: 6,
    };
    TestBed.configureTestingModule({
      providers: [
        SocietyLookupAdapter,
        { provide: GET_SOCIETIES, useValue: { execute: () => of([society]) } },
      ],
    });
    const result = await firstValueFrom(TestBed.inject(SocietyLookupAdapter).list());
    expect(result).toEqual([
      { id: 's1', code: '1001', name: 'Naviera', ruc: '20522163890', isActive: true },
    ]);
  });
});
