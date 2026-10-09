import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GET_MENUS } from '../../../menus';
import { MenuLookupPort } from '../../application/ports/out/menu-lookup.port';
import { PermissionOption } from '../../domain/models/permission-option';

/** Toma las opciones del puerto público de la feature menus y se queda con lo que Roles necesita. */
@Injectable()
export class MenuLookupAdapter implements MenuLookupPort {
  private readonly menus = inject(GET_MENUS);

  list(): Observable<PermissionOption[]> {
    return this.menus.execute().pipe(
      map((items) =>
        items.map(({ id, code, name, route, icon, parentId, isActive }) => ({
          id,
          code,
          name,
          route,
          icon,
          parentId,
          isActive,
        })),
      ),
    );
  }
}
