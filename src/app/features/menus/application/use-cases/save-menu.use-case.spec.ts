import { firstValueFrom, of } from 'rxjs';
import { MenuOption } from '../../domain/models/menu-option';
import { MenuRepositoryPort } from '../ports/out/menu-repository.port';
import { SaveMenuUseCase } from './save-menu.use-case';

const saved: MenuOption = {
  id: 'm1',
  code: 'REPORTS',
  name: 'Reportes',
  route: '/reportes',
  icon: 'book',
  order: 3,
  parentId: null,
  isActive: true,
  isSystem: false,
  roleCount: 0,
};
const command = { name: 'Reportes', route: '/reportes', icon: 'book', order: 3, parentId: null };

describe('SaveMenuUseCase', () => {
  let repo: jasmine.SpyObj<MenuRepositoryPort>;

  beforeEach(() => {
    repo = jasmine.createSpyObj<MenuRepositoryPort>('repo', [
      'list',
      'create',
      'update',
      'setStatus',
    ]);
    repo.create.and.returnValue(of(saved));
    repo.update.and.returnValue(of(saved));
    repo.setStatus.and.returnValue(of({ ...saved, isActive: false }));
  });

  it('does not touch the status when it did not change', async () => {
    await firstValueFrom(new SaveMenuUseCase(repo).execute(null, command, true));
    expect(repo.create).toHaveBeenCalledOnceWith(command);
    expect(repo.setStatus).not.toHaveBeenCalled();
  });

  it('applies the requested status after saving', async () => {
    const result = await firstValueFrom(new SaveMenuUseCase(repo).execute('m1', command, false));
    expect(repo.update).toHaveBeenCalledOnceWith('m1', command);
    expect(repo.setStatus).toHaveBeenCalledOnceWith('m1', false);
    expect(result).toBe(saved);
  });
});
