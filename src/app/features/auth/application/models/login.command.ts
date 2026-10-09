/** Ingreso con RUC, usuario, DNI o correo verificado, y contraseña. */
export interface LoginCommand {
  identifier: string;
  password: string;
}
