/** Resultado genérico de pedir la recuperación: nunca revela si el RUC existe. */
export interface PasswordResetResult {
  sent: boolean;
  maskedEmail: string;
}
