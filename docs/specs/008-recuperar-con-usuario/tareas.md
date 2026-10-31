# Spec 008 · Tareas

1. [x] Backend: `PasswordResetRequest.Identifier` (y `Ruc`), búsqueda como el login, pruebas.
2. [x] Front: campo «RUC o usuario» en ¿Olvidaste tu contraseña?
3. [x] Verificación: recuperar con usuario interno y con RUC; enlace con `user=`. · API: `prueba.aprobador`, RUC y `ruc` (compatibilidad) → 200 y token; vacío → 400. Pantalla: «Revisa tu correo» con `prueba.aprobador`. Prueba unitaria del enlace `user=ana.rios`.
4. [x] PR en nuestros repos; cliente en sus ramas, sin PR. · ivallejo/portal-proveedores-backend#4, ivallejo/portal-proveedores-mock#5; cliente: backend `feature/ajustes-pagos`, front `feature/ajustes-login`
