# Spec 009 · Diseño

## Backend

- Claim `session_start` (inicio de la sesión, segundos Unix). `ITokenIssuer.Issue` recibe el inicio; `StartSession` lo conserva al renovar.
- `POST /api/auth/renew` (autenticado): `ILoginService.RenewAsync(userId, sessionStart)` devuelve un `AuthResponse` nuevo con el mismo inicio, o 401 si la cuenta no existe, está inactiva o bloqueada, o pasaron más de `SessionLimits.MaxHours` (12). `ICurrentUser.SessionStartedAtUtc` lee el claim (tokens anteriores sin claim: la emisión `iat`).
- Administración: los correos posteriores al guardado (activación, verificación, cambio de usuario) se envían con `try/catch` y se registran en el log; `AdminUserDetail.EmailsSent` (`false` si alguno falló).

## Front

- `auth`: regla `tokenExpiresAt` (lee `exp` del JWT); puerto y caso de uso `RenewSession`; `SessionKeeperFacade` (actividad del usuario, revisión cada 30 s: renueva si faltan menos de 5 min y hubo actividad en los últimos 30; si venció, cierra con motivo).
- Interceptor: 401 → cierra y navega a `/login?sesion=vencida&returnUrl=…`.
- Login: aviso según `sesion` (`vencida` o `inactividad`).
- Usuarios: toast de advertencia cuando `emailsSent` es `false`.
