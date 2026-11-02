# Spec 007 · Tareas

1. [x] Backend: dominio, EF y migración, organización, usuarios, catálogo, perfil, seed y pruebas. · rama `feature/areas-multisociedad`
2. [x] Front: áreas, usuarios, registro de documentos, pruebas. · rama `feature/areas-multisociedad`
3. [x] Verificación en el navegador. · migración local (cada área conserva su sociedad); Finanzas editada con 1001, 1003 y 1007; quitar 1001 de Compras con una usuaria que solo tiene 1001 → 409; sin sociedades → 400; nombre repetido → 409. Migración probada aparte en SQL Server con dos «Finanzas» (se unen en la más antigua, con ambas sociedades y su usuaria) y su reversa.
4. [x] PR en nuestros repos para revisión. · backend ivallejo/portal-proveedores-backend#3, front ivallejo/portal-proveedores-mock#4
5. [x] Cliente: backend en `feature/ajustes-pagos` y front en `feature/ajustes-login`, sin PR. · backend `f279b48` (sin módulo de documentos: no hay pendientes que revisar y la migración no toca `Documents`); front `a6c9584` (sin catálogo de áreas)
6. [ ] Cierre: `AGENT_CONTEXT.md` y estado **Implementada**.
