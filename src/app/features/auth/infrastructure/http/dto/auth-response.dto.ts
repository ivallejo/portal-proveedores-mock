/** Respuesta de `api/auth/login` y `api/auth/change-password`. */
export interface AuthResponseDto {
  accessToken: string;
  expiresAtUtc: string;
  user: {
    username: string;
    email: string;
    companyName: string;
    ruc: string;
    area?: string | null;
    mustChangePassword?: boolean;
    role: string;
    roles?: string[];
  };
}
