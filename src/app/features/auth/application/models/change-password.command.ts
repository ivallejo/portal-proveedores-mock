/** `currentPassword` se omite en el cambio forzado de la contraseña temporal. */
export interface ChangePasswordCommand {
  newPassword: string;
  currentPassword?: string;
}
