import { Observable } from 'rxjs';
import { AreaSociety } from '../../domain/models/area-society';
import { GetAreaSocietiesPort } from '../ports/in/get-area-societies.port';
import { SocietyLookupPort } from '../ports/out/society-lookup.port';

export class GetAreaSocietiesUseCase implements GetAreaSocietiesPort {
  constructor(private readonly societies: SocietyLookupPort) {}

  execute(): Observable<AreaSociety[]> {
    return this.societies.list();
  }
}
