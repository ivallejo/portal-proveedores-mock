# Spec 011 · Tareas

1. [x] Reglas y modelo del informe, con pruebas unitarias. · `cead856`
2. [x] Hoja del informe de detracciones y visor reutilizable. · `8be62ce`
3. [x] Hoja del informe de retenciones (D1). · `8be62ce`
4. [x] Botones en el detalle y fachada. · `2acd710`
5. [x] Verificación y PR (#8). Solo falta la prueba con SAP real.
   - [x] `npm run quality`, `ng test` (137 pruebas) y `ng build`.
   - [x] Navegador con órdenes simuladas: botones y «No aplica»; informe con dos comprobantes de una constancia; informe de retenciones; orden en dólares y sin RUC de sociedad; Volver y Escape regresan al detalle; el título de impresión propone el nombre del archivo; la vista previa de la orden sigue igual.
   - [x] PDF real guardado desde la ventana de impresión, revisado por el usuario el 2026-11-09.
   - [ ] Prueba con datos reales de SAP (QAS o VPN).
