# Spec 006 · Tareas

1. [x] Backend: dominio, EF, migración, login, administración, perfil, seed y pruebas. · backend `e139911` y el usuario en el listado (siguiente commit)
2. [x] Front: formulario y listado de usuarios, perfil, pruebas. · front (commit «Usuarios: usuario libre y documento de identidad»)
3. [x] Verificación en el navegador: alta de interno con usuario libre, edición del usuario, ingreso con usuario y rechazo con correo/DNI. · alta con CE y usuario propuesto `lnahui`, cambio a `lucia.nahui`, duplicado → 409, con espacio → 400; login `prueba.admin`/`PRUEBA.ADMIN` 200 y con DNI 401; migración local: los 5 internos quedaron con DNI
4. [ ] Cliente: backend en `feature/ajustes-pagos` y front en `feature/ajustes-login`, sin PR.
5. [ ] Cierre: `AGENT_CONTEXT.md` y estado **Implementada**.
