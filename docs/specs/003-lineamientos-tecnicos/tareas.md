# Spec 003 · Lineamientos técnicos · Tareas

Diseño: cambios de plataforma y configuración, sin tocar reglas de negocio. Cada tarea se hace primero en nuestros repos; al cerrar la spec se lleva a los del cliente en una rama `feature/lineamientos` (D6).

- [ ] **T1** · Entregable técnico inicial `docs/ENTREGABLE_TECNICO.md` a partir de `ARQUITECTURA.md`. *(R9)*
- [ ] **T2** · Front: `ng update` de 20 a 21 y de 21 a 22, TypeScript 6, dependencias compatibles y `engines.node`. *(R1)*
- [ ] **T3** · Front: `config.json` cargado al arrancar (`apiBaseUrl`, `features`), con error claro si falta; se eliminan los valores por ambiente del build. *(R2, D3)*
- [ ] **T4** · Front: `web.config` para IIS en `public/`. *(R3)*
- [ ] **T5** · Backend: ambiente QAS (`appsettings.QAS.json`) tratado como no-Desarrollo en las validaciones. *(R2)*
- [ ] **T6** · Backend: SAP simulado y seed de desarrollo bloqueados fuera de Desarrollo, con pruebas. *(R4)*
- [ ] **T7** · Backend: comando para generar el script SQL idempotente y prueba con usuario sin DDL. *(R5)*
- [ ] **T8** · Backend: health check de Blob Storage. *(R6)*
- [ ] **T9** · Backend: auditoría de logs y prueba del log de arranque. *(R7)*
- [ ] **T10** · README de front y backend según la sección 10. *(R3, R8)*
- [ ] **T11** · Llevar los cambios a los repos del cliente (`feature/lineamientos` → PR a `development`), sin rastros y con el autor correcto. *(D1, D6)*
