# Portal de Proveedores · Frontend

Leer primero [`docs/AGENT_CONTEXT.md`](docs/AGENT_CONTEXT.md): arquitectura, «dónde va cada cosa», rutas por rol, reglas de negocio y qué sigue en memoria.

- Arquitectura hexagonal por feature (`domain`, `application` con `ports/in|out` y `use-cases`, `infrastructure`, `presentation`, `di`). Las pantallas llegan a los casos de uso por los tokens de `di/`, nunca por un adaptador. Otra feature solo se importa por su `index.ts`.
- Un tipo o componente por archivo; plantillas en `.html`. Nombres de código en inglés; textos de la interfaz y URLs en español (Perú).
- Angular 20 standalone + signals + `OnPush`; Tailwind CSS 4 con tokens en `src/styles.css`. No agregar SCSS.
- Reutilizar `shared/ui` (botones `.btn-*`, `app-select`, `app-dialog`, `app-drawer`, `app-badge`, `app-callout`, `app-pagination`…) antes de crear componentes nuevos.
- Antes de terminar: `npm run quality` (formato, tipos y reglas de arquitectura), `npm test` y `npm run build`. Si una regla de arquitectura falla, mover el código a su capa; no desactivar la regla.
- El diseño de referencia es la Propuesta 1 del lienzo «Portal de Proveedores» en claude.ai.
