import { Observable } from 'rxjs';
import { UserDetail } from '../../../domain/models/user-detail';

export interface ChangeUserStatusPort {
  execute(id: string, isActive: boolean): Observable<UserDetail>;
}
