# Spec 004 · Política de contraseñas · Tareas

Diseño:
- **Dominio:** `PasswordPolicy` pasa a evaluar la contraseña con el contexto del usuario (usuario, nombres) y devuelve las reglas incumplidas. La lista de palabras comunes es un recurso del dominio.
- **Historial:** entidad `PasswordHistory` (usuario, hash, fecha) con migración; `PasswordService` verifica los últimos 5 hashes con `IPasswordHasher` antes de aceptar el cambio.
- **Vencimiento:** `AppUser.PasswordExpired(now)` (más de 90 días); el login emite el token de solo cambio de contraseña, igual que con la contraseña temporal, e informa el motivo.
- **Front:** `passwordRules(value, user)` con las reglas nuevas; la pantalla de cambio obligatorio muestra el motivo.

- [x] **T1** · Dominio: nueva `PasswordPolicy` (12 caracteres, 3 de 4 tipos, usuario y nombres, palabras comunes) con pruebas. *(R1, D1, D2)* — `9c273be` (backend)
- [x] **T2** · Aplicación: usar la política con el contexto del usuario en activación, recuperación, cambio, administrador y seed; mensajes por regla. *(R1)* — `9c273be` (backend)
- [x] **T3** · Historial de las últimas 5 contraseñas: entidad, migración, verificación y pruebas (incluida integración con SQL Server). *(R2)* — `9c273be` (backend)
- [x] **T4** · Vencimiento de 90 días en el login con el flujo de cambio obligatorio y pruebas. *(R3, D3, D4)* — `9c273be` (backend)
- [x] **T5** · Front: reglas nuevas, mensajes del backend y motivo del cambio obligatorio, con pruebas. *(R4)* — front
- [x] **T6** · Documentación (README, AGENT_CONTEXT, `.env.example` y seed con contraseñas temporales que cumplan) y prueba en el navegador: palabra común, nombre, vencimiento e historial verificados. — `9c273be` (backend), front
- [x] **T7** · Llevar los cambios a los repos del cliente en un solo PR por repo contra `master`. — backend PR #10, front PR #7 (`feature/politica-contrasenas`)
