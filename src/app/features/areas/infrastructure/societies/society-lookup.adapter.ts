import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GET_SOCIETIES } from '../../../societies';
import { SocietyLookupPort } from '../../application/ports/out/society-lookup.port';
import { AreaSociety } from '../../domain/models/area-society';

/** Toma las sociedades del puerto público de la feature societies y se queda con lo que Áreas necesita. */
@Injectable()
export class SocietyLookupAdapter implements SocietyLookupPort {
  private readonly societies = inject(GET_SOCIETIES);

  list(): Observable<AreaSociety[]> {
    return this.societies
      .execute()
      .pipe(
        map((items) =>
          items.map(({ id, code, name, ruc, isActive }) => ({ id, code, name, ruc, isActive })),
        ),
      );
  }
}
