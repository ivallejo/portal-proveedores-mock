# Spec 012 · Tareas

1. [x] Backend: tipo de entrega en dominio, contratos, simulador SAP y migración `AddDeliveryType`, con pruebas (154). · backend `cdfe518`
2. [x] Front: tipo de entrega y etiqueta carrier / orden de compra. · `9804ee9`
3. [x] Front: validar la orden al registrar y quitar el bloqueo de archivos. · `9804ee9`
4. [x] Front: textos del resultado (R3) y tipo de entrega en el detalle. · `9804ee9`
5. [x] Flujo 01 actualizado.
6. [ ] Verificación y PR en ambos repos.
   - [x] `npm run quality`, `ng test` (139), `ng build`; backend `dotnet test` (154).
   - [x] Navegador: Servicio → Tipo de entrega, etiquetas de Bien, a bordo y almacén; carrier inexistente rechazado en línea conservando los archivos; carrier de almacén `CR-2026-00527` registrado con el texto y los datos del diseño; detalle de Contabilización con «Entregado en almacén» y N° de carrier.
   - [ ] PR.
