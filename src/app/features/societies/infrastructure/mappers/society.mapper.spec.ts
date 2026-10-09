import { toSaveSocietyRequest, toSociety } from './society.mapper';

describe('society mapper', () => {
  it('maps the API response and the save request', () => {
    const dto = {
      id: '1',
      code: '1001',
      name: 'Naviera',
      ruc: '20522163890',
      billingEmail: null,
      isActive: true,
      areaCount: 5,
      userCount: 6,
    };
    expect(toSociety(dto)).toEqual(dto);
    const command = { code: '1001', name: 'Naviera', ruc: '20522163890', billingEmail: 'a@b.pe' };
    expect(toSaveSocietyRequest(command)).toEqual(command);
  });
});
