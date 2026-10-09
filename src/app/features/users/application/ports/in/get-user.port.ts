import { Observable } from 'rxjs';
import { UserDetail } from '../../../domain/models/user-detail';

export interface GetUserPort {
  execute(id: string): Observable<UserDetail>;
}
