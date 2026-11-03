# Spec 009 · Tareas

1. [x] Backend: claim de inicio, `auth/renew`, correos que fallan, pruebas. · backend `3f3938d` (151 pruebas)
2. [x] Front: renovación, avisos en el login, aviso en Usuarios, pruebas. · 128 pruebas
3. [x] Verificación local. · `auth/renew` conserva `session_start` y extiende `exp`; sin token o con token inválido → 401. Con token inválido, buscar en Usuarios lleva a `/login?sesion=vencida&returnUrl=…` con el aviso y, al ingresar, vuelve a Usuarios. Correo que falla: cubierto por prueba (`FailingEmailSender`).
4. [ ] PR en nuestros repos; PR nuevo al cliente.
