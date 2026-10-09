import { Observable } from 'rxjs';

export interface ListWorkflowApproversPort {
  execute(): Observable<string[]>;
}
