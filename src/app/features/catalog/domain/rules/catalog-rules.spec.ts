import { CatalogArea } from '../models/catalog-area';
import { approversOf, areasOfCompany } from './catalog-rules';

const areas: CatalogArea[] = [
  {
    id: 'a1',
    name: 'Compras',
    companyCode: '1001',
    approvers: [
      { id: 'p1', name: 'Ana', email: 'ana@b.pe', companyCodes: ['1001'] },
      { id: 'p2', name: 'Luis', email: 'luis@b.pe', companyCodes: ['1001', '2002'] },
    ],
  },
  { id: 'a2', name: 'Compras', companyCode: '2002', approvers: [] },
  { id: 'a3', name: 'Logística', companyCode: '1001', approvers: [] },
];

describe('catalog-rules', () => {
  it('filtra las áreas de una sociedad', () => {
    expect(areasOfCompany(areas, '1001').map((area) => area.id)).toEqual(['a1', 'a3']);
  });

  it('busca los aprobadores del área en la sociedad y excluye al actual', () => {
    expect(approversOf(areas, 'Compras', '1001').map((item) => item.id)).toEqual(['p1', 'p2']);
    expect(approversOf(areas, 'Compras', '1001', 'Ana').map((item) => item.id)).toEqual(['p2']);
    expect(approversOf(areas, 'Compras', '2002')).toEqual([]);
    expect(approversOf(areas, 'Finanzas')).toEqual([]);
  });
});
