import { of } from 'rxjs';
import { Society } from '../../domain/models/society';
import { SocietyRepositoryPort } from '../ports/out/society-repository.port';
import { ChangeSocietyStatusUseCase } from './change-society-status.use-case';
import { SaveSocietyUseCase } from './save-society.use-case';

const society: Society = {
  id: '1',
  code: '1001',
  name: 'Naviera',
  ruc: '20522163890',
  billingEmail: null,
  isActive: true,
  areaCount: 0,
  userCount: 0,
};
const command = { code: '1001', name: 'Naviera', ruc: '20522163890', billingEmail: 'a@b.pe' };

function repository(): jasmine.SpyObj<SocietyRepositoryPort> {
  const repo = jasmine.createSpyObj<SocietyRepositoryPort>('repo', [
    'list',
    'create',
    'update',
    'setStatus',
  ]);
  repo.create.and.returnValue(of(society));
  repo.update.and.returnValue(of(society));
  repo.setStatus.and.returnValue(of(society));
  return repo;
}

describe('society use cases', () => {
  it('creates without id and updates with id', () => {
    const repo = repository();
    const save = new SaveSocietyUseCase(repo);
    save.execute(null, command).subscribe();
    save.execute('1', command).subscribe();
    expect(repo.create).toHaveBeenCalledOnceWith(command);
    expect(repo.update).toHaveBeenCalledOnceWith('1', command);
  });

  it('changes the status through the repository', () => {
    const repo = repository();
    new ChangeSocietyStatusUseCase(repo).execute('1', false).subscribe();
    expect(repo.setStatus).toHaveBeenCalledOnceWith('1', false);
  });
});
