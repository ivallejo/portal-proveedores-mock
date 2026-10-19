# Specs (desarrollo guiado por especificaciones)

Todo cambio de comportamiento del portal (front o backend) parte de una spec escrita y revisada **antes** de programar.

## Fuentes

- [`docs/flujos/`](../flujos/README.md): los flujos de negocio aprobados (diagrama Mermaid + reglas). Son la fuente de verdad del «qué».
- `docs/specs/NNN-nombre/`: un cambio por carpeta, numerado.
- [`docs/consultas-negocio.md`](../consultas-negocio.md): huecos y dudas que el usuario debe definir antes de abrir una spec.

## Proceso

1. **Flujo**: si negocio cambia un flujo, se actualiza su archivo en `docs/flujos/` (diagrama, reglas y versión).
2. **Requisitos** (`requisitos.md`): diferencias entre el flujo y lo implementado, cada una con criterios de aceptación verificables; decisiones abiertas con quién decide; fuera de alcance.
3. **Diseño** (`diseno.md`): cómo se implementa en cada capa y repo (endpoints, reglas, pantallas, pruebas).
4. **Tareas** (`tareas.md`): pasos pequeños; cada uno es un commit verificado (build, pruebas, `npm run quality` / `dotnet test`). Se marcan con el commit al cerrarlos.
5. **Revisión**: se revisa la spec y se cierran las decisiones antes de implementar. Si al implementar algo cambia, se actualiza primero la spec.
6. **Cierre**: se actualizan `FLUJO_ACTUAL.md` y los `AGENT_CONTEXT.md`, y la spec pasa a **Implementada**.

## Estados

`Borrador` → `Aprobada` → `En curso` → `Implementada` (o `Descartada`).

## Índice

| Spec | Estado | Resumen |
|---|---|---|
| [001 · Flujos documentales v2](001-flujos-documentales-v2/requisitos.md) | Implementada | Ajustes de Con OC, Sin OC y Contabilización a los flujos de negocio del 2026-10-17 |
| [002 · Archivos en Blob Storage](002-archivos-en-blob-storage/requisitos.md) | Implementada | Adjuntos en Azure Blob Storage (Azurite en desarrollo) |
