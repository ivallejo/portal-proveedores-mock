import { Observable } from 'rxjs';
import { PermissionOption } from '../../domain/models/permission-option';
import { GetPermissionOptionsPort } from '../ports/in/get-permission-options.port';
import { MenuLookupPort } from '../ports/out/menu-lookup.port';

export class GetPermissionOptionsUseCase implements GetPermissionOptionsPort {
  constructor(private readonly menus: MenuLookupPort) {}

  execute(): Observable<PermissionOption[]> {
    return this.menus.list();
  }
}
