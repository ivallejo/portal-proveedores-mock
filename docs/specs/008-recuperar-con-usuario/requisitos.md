# Spec 008 · Recuperar contraseña con RUC o usuario · Requisitos

| Campo | Valor |
|---|---|
| Estado | **En curso** · pedido directo del usuario el 2026-10-30 |
| Fecha | 2026-10-30 |
| Origen | «¿Olvidaste tu contraseña?» solo acepta un RUC de 11 dígitos; desde la spec 006 el personal interno ingresa con un usuario libre |
| Repos | Backend y frontend (nuestros, en `feature/recuperar-con-usuario` con PR; luego los del cliente) |

## Requisitos
- [x] La pantalla pide **RUC o usuario**, con la misma búsqueda del login: el usuario (sin distinguir mayúsculas) o, para el proveedor, su RUC.
- [x] El correo de recuperación llega al correo principal; el enlace identifica al proveedor por `ruc` y al personal interno por `user` (como en la activación).
- [x] La respuesta sigue siendo la misma exista o no la cuenta (no revela qué usuarios existen).
- [x] La API acepta `identifier`; `ruc` se sigue aceptando para no romper un front anterior.

## Fuera de alcance
- Recuperar con el correo o el documento (no sirven para ingresar, spec 006).
