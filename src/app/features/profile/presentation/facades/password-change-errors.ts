/** Errores del formulario de contraseña: la actual (o el error del servidor), los requisitos y la confirmación. */
export interface PasswordChangeErrors {
  current?: string;
  rules?: boolean;
  mismatch?: boolean;
}
