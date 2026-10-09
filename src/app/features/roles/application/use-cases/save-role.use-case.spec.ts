import { firstValueFrom, of } from 'rxjs';
import { AccessRole } from '../../domain/models/access-role';
import { RoleRepositoryPort } from '../ports/out/role-repository.port';
import { SaveRoleUseCase } from './save-role.use-case';

const saved: AccessRole = {
  id: 'r1',
  code: 'BUYER',
  name: 'Compras',
  description: null,
  isActive: true,
  isSystem: false,
  userCount: 0,
  menuIds: ['home'],
};
const command = { name: 'Compras', description: '', menuIds: ['home'] };

describe('SaveRoleUseCase', () => {
  it('creates the role and applies a changed status afterwards', async () => {
    const repo = jasmine.createSpyObj<RoleRepositoryPort>('repo', [
      'list',
      'create',
      'update',
      'setStatus',
    ]);
    repo.create.and.returnValue(of(saved));
    repo.setStatus.and.returnValue(of({ ...saved, isActive: false }));
    const result = await firstValueFrom(new SaveRoleUseCase(repo).execute(null, command, false));
    expect(repo.create).toHaveBeenCalledOnceWith(command);
    expect(repo.setStatus).toHaveBeenCalledOnceWith('r1', false);
    expect(result).toBe(saved);
  });
});
