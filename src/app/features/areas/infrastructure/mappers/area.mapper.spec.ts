import { toArea, toSaveAreaRequest } from './area.mapper';

describe('area mapper', () => {
  it('translates the API companies to the societies of the area', () => {
    const area = toArea({
      id: 'a1',
      name: 'Compras',
      description: null,
      companies: [
        { id: 's1', code: '1001', name: 'Naviera', isActive: true },
        { id: 's2', code: '1003', name: 'Petral', isActive: false },
      ],
      isActive: true,
      userCount: 2,
    });
    expect(area.societies.map((society) => society.code)).toEqual(['1001', '1003']);
    expect(
      toSaveAreaRequest({ societyIds: ['s1', 's2'], name: 'Compras', description: '' }),
    ).toEqual({ companyIds: ['s1', 's2'], name: 'Compras', description: '' });
  });
});
