import { Observable } from 'rxjs';
import { UserDetail } from '../../../domain/models/user-detail';
import { SaveUserCommand } from '../../models/save-user.command';

export interface SaveUserPort {
  execute(id: string | null, command: SaveUserCommand): Observable<UserDetail>;
}
