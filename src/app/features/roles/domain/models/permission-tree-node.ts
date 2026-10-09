import { PermissionOption } from './permission-option';

/** Fila del árbol de permisos: la opción, si está marcada y si sus submenús están marcados en parte. */
export interface PermissionTreeNode {
  menu: PermissionOption;
  on: boolean;
  mixed: boolean;
  isChild: boolean;
}
