# Spec 007 · Áreas en varias sociedades · Requisitos

| Campo | Valor |
|---|---|
| Estado | **En curso** · aprobada el 2026-10-30 (D1 y D2 como se propusieron) |
| Fecha | 2026-10-30 |
| Origen | Pedido del cliente: al crear un área se indican las sociedades a las que pertenece, en lugar de elegir una sociedad primero |
| Repos | Backend y frontend (nuestros, en la rama `feature/areas-multisociedad` con PR para revisión; luego los del cliente) |

## Contexto

Cada área pertenece a una sola sociedad (`Area.CompanyId`); el nombre es único dentro de la sociedad. Los permisos sobre documentos ya usan las sociedades del usuario, no la del área.

## Requisitos

### R1 · Configuración › Áreas
- [x] Al crear o editar se marcan una o más sociedades (activas al agregarlas).
- [x] El listado muestra las sociedades de cada área; el filtro «Sociedad» trae las áreas que la incluyen; la búsqueda también encuentra por sociedad.
- [x] El nombre del área es único en todo el portal (D1).

### R2 · Quitar una sociedad de un área (D2)
- [x] Se rechaza, con el motivo, si algún usuario del área queda sin sociedades en común con ella.
- [x] Se rechaza si hay documentos pendientes de aprobación de esa área en la sociedad que se quita.

### R3 · Usuarios
- [x] El área del usuario debe compartir al menos una sociedad con él.
- [x] El menú de áreas muestra las que comparten alguna sociedad con las marcadas.

### R4 · Registro de documentos
- [x] Al elegir la sociedad se listan las áreas que la incluyen; los aprobadores se siguen filtrando por sus propias sociedades.

### R5 · Sociedades, perfil y seed
- [x] Configuración › Sociedades cuenta las áreas que incluyen cada sociedad.
- [x] Mi perfil muestra el área con las sociedades que tiene en común con el usuario.
- [x] Seed: las áreas llevan `companies` (`company` sigue aceptado); el usuario indica el área solo por su nombre (`CÓDIGO:Nombre` sigue aceptado).

### R6 · Datos existentes
- [x] Migración: tabla `AreaCompanies` con la sociedad actual de cada área. Las áreas con el mismo nombre en varias sociedades se unen en una (la más antigua), con sus usuarios y documentos.

## Fuera de alcance
- Cambios en aprobaciones, contabilización o permisos de documentos (ya usan las sociedades del usuario).
