import { toArea, toSaveAreaRequest } from './area.mapper';

describe('area mapper', () => {
  it('translates the API company fields to the society of the area', () => {
    const area = toArea({
      id: 'a1',
      name: 'Compras',
      description: null,
      companyId: 's1',
      companyCode: '1001',
      companyName: 'Naviera',
      isActive: true,
      userCount: 2,
    });
    expect(area).toEqual(
      jasmine.objectContaining({ societyId: 's1', societyCode: '1001', societyName: 'Naviera' }),
    );
    expect(toSaveAreaRequest({ societyId: 's1', name: 'Compras', description: '' })).toEqual({
      companyId: 's1',
      name: 'Compras',
      description: '',
    });
  });
});
