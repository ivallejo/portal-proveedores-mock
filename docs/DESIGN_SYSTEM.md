# Sistema visual M3 sobre Tailwind CSS 4

Lenguaje visual **no cromático** inspirado en Material Design 3, tomando como referencia Angular Material 22.2.3.
Tailwind CSS sigue siendo el framework de layout y utilidades; la **paleta de colores no cambia**.

## Versiones y compatibilidad

| Paquete                                | Versión instalada                                                      |
| -------------------------------------- | ---------------------------------------------------------------------- |
| Angular (`@angular/core`)              | 20.3.32                                                                |
| Tailwind CSS                           | 4.3.3 (configuración CSS-first con `@theme`, sin `tailwind.config.js`) |
| Angular Material / CDK                 | **No instalados**                                                      |
| Roboto (`@fontsource-variable/roboto`) | 5.3.0                                                                  |

Angular Material 22.2.3 existe en npm, pero exige `@angular/core ^22 || ^23` y `@angular/cdk 22.2.3`.
Con Angular 20 es **incompatible**, por eso no se instala: se toman de su sistema M3 solo los valores de
tipografía, forma, elevación y movimiento y se aplican con Tailwind. Si el proyecto sube a Angular 22,
se podría evaluar instalarlo; mientras tanto no hace falta.

## Archivos

- `src/styles/m3-tokens.css`: tokens M3 (tipografía, forma, movimiento, alias de elevación). **No contiene colores.**
- `src/styles.css`: paleta (sin cambios), sombras con geometría M3, animaciones y clases de componentes (`.field`, `.btn-*`, `.card`…).
- `angular.json` → `styles`: carga `@fontsource-variable/roboto/index.css` antes de `src/styles.css`.

## Roboto

- Fuente variable autoalojada (pesos 100–900 en un solo archivo por alfabeto, `font-display: swap`).
  Angular copia los `.woff2` a `media/` en el build: **no hay conexión externa** a Google Fonts, así que funciona
  en entornos de producción sin salida a internet. Cada alfabeto (latín, latín extendido, griego, cirílico,
  vietnamita) declara su `unicode-range`; el navegador descarga solo el que se usa (latín para español).
- Pila: `'Roboto Variable', Roboto, 'Helvetica Neue', Arial, sans-serif`.
- Pesos usados: 400 (cuerpo, títulos grandes), 500 (títulos, etiquetas, botones, énfasis) y 700 solo para cifras
  destacadas (`tabular-nums`: KPI, totales) y para resaltar el elemento seleccionado en listas y pasos.

## Tipografía (escala M3)

Utilidades `text-<rol>`; cada rol fija tamaño, interlineado, tracking y peso. Un `leading-*`, `tracking-*` o `font-*`
en la plantilla tiene prioridad sobre el valor del rol.

| Rol          | Tamaño / línea | Peso | Uso en el portal                                          |
| ------------ | -------------- | ---- | --------------------------------------------------------- |
| `display-m`  | 45 / 52        | 400  | Titular de la pantalla de acceso                          |
| `headline-l` | 32 / 40        | 400  | Título de página en escritorio                            |
| `headline-m` | 28 / 36        | 400  | Títulos de acceso y de inicio                             |
| `headline-s` | 24 / 32        | 400  | Título de página en móvil, títulos de diálogo             |
| `title-l`    | 22 / 28        | 400  | Cabecera de drawer, cifras KPI, marca                     |
| `title-m`    | 16 / 24        | 500  | Títulos de tarjeta y de sección                           |
| `title-s`    | 14 / 20        | 500  | Encabezados de tabla, datos destacados, etiquetas fuertes |
| `body-l`     | 16 / 24        | 400  | Descripciones de página, texto de inputs de acceso        |
| `body-m`     | 14 / 20        | 400  | Texto general, celdas, campos, opciones                   |
| `body-s`     | 12 / 16        | 400  | Ayudas, metadatos, textos secundarios                     |
| `label-l`    | 14 / 20        | 500  | Botones (`.btn`), elementos principales del menú lateral  |
| `label-m`    | 12 / 16        | 500  | Etiquetas de campo (`.field-label`), badges, eyebrows     |
| `label-s`    | 11 / 16        | 500  | Etiquetas pequeñas («Pronto», contadores)                 |

Los títulos grandes llevan `font-medium` para conservar jerarquía en una aplicación empresarial.

## Forma (esquinas)

| Token                   | Valor   | Componentes                                                                                                                  |
| ----------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `rounded-shape-xs`      | 4px     | `.field`, inputs, `app-select` (disparador, panel y opciones), selector de fechas (disparador), snackbar/toast               |
| `rounded-shape-sm`      | 8px     | Chips y atajos de fecha, etiquetas de código, mosaicos pequeños, comentarios                                                 |
| `rounded-shape-md`      | 12px    | `.card`, paneles internos de diálogos, `app-callout`, tarjetas seleccionables, mosaicos de icono, zona de carga              |
| `rounded-shape-lg`      | 16px    | Panel del selector de fechas                                                                                                 |
| `rounded-shape-xl`      | 28px    | `app-dialog`, `app-confirm-dialog`, tarjeta de acceso, hoja inferior móvil del calendario (`rounded-t-shape-xl`)             |
| `rounded-full`          | píldora | `.btn-*`, botones de icono (cabecera, tablas, paginación, cerrar), controles segmentados, indicador del menú lateral, badges |
| `rounded-xs` (Tailwind) | 2px     | Casillas de verificación                                                                                                     |

## Elevación

Las sombras existentes conservan **exactamente su color** y adoptan la geometría de dos capas de M3:

| Nivel | Geometría                       | Tokens                                                                                                       |
| ----- | ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1     | `0 1px 2px 0` + `0 1px 3px 1px` | `shadow-card`, `shadow-segment`, `shadow-nav-active`                                                         |
| 2     | `0 1px 2px 0` + `0 2px 6px 2px` | `shadow-pop` (menús), `shadow-pop-up`, `shadow-option`                                                       |
| 3     | `0 1px 3px 0` + `0 4px 8px 3px` | `shadow-dialog`, `shadow-toast`, `shadow-picker`, `shadow-sheet` (drawer), `shadow-auth`, `shadow-auth-card` |

`shadow-picker` y `shadow-sheet` reemplazan dos sombras arbitrarias de plantilla (selector de fechas y drawer) con el
mismo color que tenían.

### Elevación de los botones (excepción cromática autorizada)

Para que la elevación de los botones se perciba como en Angular Material, `--elevation-1…3` usan sombras propias
(`--shadow-elevation-1…3` en `src/styles.css`) con las opacidades de M3 (**30 %** sombra clave, **15 %** ambiental).
En lugar del negro puro de Material se usa el tono `ink` de la paleta (`rgba(14, 42, 92, …)`): sobre los fondos azulados
del portal, una sombra negra se ve gris y sucia, y el azul marino la integra con la paleta. Es el único valor de color
nuevo de este cambio: `rgba(14, 42, 92, 0.15)` (el 30 % ya existía).

| Botón                                                              | Reposo        | Hover         | Pulsado       |
| ------------------------------------------------------------------ | ------------- | ------------- | ------------- |
| `.btn-primary`, `.btn-success`, `.btn-danger` (filled)             | nivel 0       | nivel 1       | nivel 0       |
| `.btn-tint` (tonal)                                                | nivel 0       | nivel 1       | nivel 0       |
| `.btn-secondary`, `.btn-outline`, `.btn-outline-danger` (outlined) | sin elevación | sin elevación | sin elevación |

## Onda de pulsación (ink ripple)

- `shared/ui/ripple/ripple.ts` (`Ripple`), iniciado en `app.config.ts` con `provideAppInitializer`. Un solo listener
  `pointerdown` en el documento, fuera de la detección de cambios: no hay directivas por componente.
- Recibe la onda todo `.btn-*` y cualquier elemento con la clase **`ripple`**: botones de icono (cabecera, tablas,
  paginación, cerrar diálogo/drawer, mostrar contraseña), opciones de `app-select`, pestañas, controles segmentados,
  tarjetas seleccionables, menú lateral, celdas y atajos del calendario, y la tarjeta enlazada de inicio.
- Sin onda, como en Angular Material: disparadores de campo (`app-select`, rango de fechas), enlaces de texto, interruptores.
- Comportamiento: nace en el punto de pulsación y se expande hasta la esquina más lejana (300 ms,
  `ease-standard-decelerate`); al soltar se desvanece (200 ms) y se retira del DOM. Se recorta con la forma del elemento
  (`border-radius: inherit`). No actúa en elementos deshabilitados, con el botón secundario del ratón ni con
  `prefers-reduced-motion: reduce`.
- Color: `currentColor` del elemento con la opacidad de estado de M3 (12 %): blanco sobre botones rellenos, azul o tinta
  sobre los claros. No añade valores de color.
- Para un elemento nuevo: si es un botón usar `.btn-*`; si es otro control con forma, añadir la clase `ripple`.

## Movimiento

| Token                                                                    | Valor                             | Uso                                                                              |
| ------------------------------------------------------------------------ | --------------------------------- | -------------------------------------------------------------------------------- |
| `ease-standard`                                                          | `cubic-bezier(0.2, 0, 0, 1)`      | Cambios de estado (hover, foco, selección); curva por defecto de `transition*`   |
| `ease-emphasized-decelerate`                                             | `cubic-bezier(0.05, 0.7, 0.1, 1)` | Entradas: `animate-in` (300 ms), `animate-pop` (250 ms), `animate-menu` (200 ms) |
| `ease-standard-decelerate` / `-accelerate`, `ease-emphasized-accelerate` | M3                                | Disponibles para entradas/salidas                                                |
| `--duration-short-1…4`, `--duration-medium-1…4`                          | 50–400 ms                         | Duraciones en CSS                                                                |

- Transición por defecto de Tailwind: 150 ms con `ease-standard`.
- Botones, enlaces, opciones, pestañas y `label` animan color de fondo, borde, texto, sombra y opacidad durante 150 ms
  (regla base sin especificidad: cualquier `transition-*` de la plantilla la reemplaza).
- `animate-menu` (escala vertical + opacidad, `origin-top`/`origin-bottom`) en `app-select` y en el panel de fechas.
- `prefers-reduced-motion: reduce` anula animaciones y transiciones (regla global existente).

## Estados interactivos

- **Foco de campo**: utilidad `field-focus-ring` = borde primario de 2 px (anillo interior, sin mover el contenido),
  **sin halo exterior** (como el campo con contorno de Angular Material). Se aplica en `.field:focus`,
  `focus:field-focus-ring` (inputs de acceso y contraseña), `[class.field-focus-ring]` (`app-select` y selector de
  fechas abiertos) y `focus-visible:field-focus-ring` (esos disparadores enfocados con teclado, en lugar del contorno
  de 3 px de los botones).
- **Foco de teclado**: contorno de 3 px separado 2 px con el color existente, en `.btn` y en enlaces, botones,
  opciones, pestañas y elementos con `tabindex`.
- **Hover / pressed / selected / disabled / error**: usan los mismos colores de siempre; solo se añaden transiciones
  la onda de pulsación y, en botones rellenos y tonales, el cambio de elevación.

## Escala de alturas

| Altura                           | Uso                                                                                                             |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 40 px (`size-10`, `h-10`)        | Botones de icono (tablas, cabecera, paginación, cerrar), chips, segmentos, subir archivo                        |
| 48 px (`h-12`, `.btn`, `.field`) | Campos, `app-select`, rango de fechas, botones de texto, controles segmentados de formularios, opciones de menú |

Los botones de icono llevan `touch-target`: en pantallas táctiles su zona pulsable crece a 48 px sin cambiar el tamaño
visible. Las celdas del calendario no la llevan porque están pegadas entre sí.

## Modales: foco y salida animada

- `appFocusTrap` (`shared/ui/focus-trap`) en `app-dialog`, `app-drawer` y `app-confirm-dialog`: al abrir, el foco va al
  panel (el lector anuncia el título); Tab y Shift+Tab no salen del panel; al cerrar, el foco vuelve al botón que lo abrió.
- Salidas con `animate.leave` nativo de Angular 20.3 y la clase `animate-leave` (`src/styles/m3-tokens.css`): el elemento
  se desvanece en 150 ms y su entrada (`animate-pop`, `animate-in`, `animate-menu`) se reproduce al revés. Se usa en
  diálogos, drawers y confirmaciones (en el anfitrión del componente), `app-select`, selector de fechas, toast, menú móvil
  y su fondo. En pruebas, TestBed desactiva las animaciones salvo con `animationsEnabled: true`.
- Fondo de los modales: token `bg-scrim` (32 % sobre `ink`, la opacidad de M3), igual en diálogos, drawers, confirmación,
  hoja de fechas y menú móvil.

## Tooltip

`Tooltip` (`shared/ui/tooltip`), iniciado en `app.config.ts`, muestra un tooltip M3 en cualquier elemento con
`data-tooltip="Texto"` o `[attr.data-tooltip]="expresión"`: 500 ms al pasar el cursor, inmediato con el teclado, se
oculta al salir, al pulsar, con Escape o al desplazar. Enlaza `aria-describedby` cuando el texto no repite el
`aria-label`. No se muestra con toques. **No usar el atributo `title`** en botones y enlaces.

## Avisos (toast)

`ToastService.show(mensaje, opciones)`: `tone` (`success`, `error`, `info`) cambia el ícono y el rol (`alert` en errores);
`action` agrega un botón de texto («Reintentar», «Ver»); la duración se calcula por la longitud del mensaje (4–10 s;
6 s mínimo con acción). En móvil ocupa el ancho de la pantalla abajo; en escritorio, abajo a la derecha. Sigue aceptando
un número como segundo argumento (duración mínima).

## Tablas

- `.table-scroll`: contenedor con desplazamiento en ambos ejes (alto máximo `min(72vh, 46rem)`).
- `.table-head`: cabecera fija arriba. `.table-actions`: columna de acciones fija a la derecha, visible sin desplazar en
  pantallas estrechas (en lugar de un menú «⋮», que seguiría fuera de la vista dentro de la misma columna).
- Filas de 52 px de alto mínimo (`h-13` / `min-h-13`). Montos alineados a la derecha con `tabular-nums` (ya lo estaban).
- `app-pagination` muestra «Filas por página» (10, 25, 50) cuando hay más resultados que la opción menor; las facades
  exponen `pageSize()` y `setPageSize()`, que vuelve a la página 1 (usuarios vuelve a consultar la API).

## Navegación por tamaño de pantalla

| Ancho       | Navegación                                                                                                                                |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| < 768 px    | Menú lateral como panel que se abre encima (botón de la cabecera)                                                                         |
| 768–1279 px | Rail M3 (`app-nav-rail`, 80 px): ícono + etiqueta corta con tooltip; un grupo con submenús abre el menú completo con ese grupo desplegado |
| ≥ 1280 px   | Menú lateral completo fijo                                                                                                                |

## Reglas para mantener el sistema

1. No usar tamaños de texto arbitrarios (`text-[13px]`) ni `text-sm/xs/lg…`: elegir un rol `text-<rol>`.
2. No usar radios arbitrarios (`rounded-[10px]`) ni `rounded-lg/xl`: elegir `rounded-shape-*` o `rounded-full` según la tabla.
3. No crear sombras nuevas en plantillas: usar un token existente. Si hace falta otra, definirla en `src/styles.css`
   con un color que ya exista y una geometría de la tabla de elevación.
4. No escribir colores en las plantillas (`bg-[#…]`, `text-[rgba(…)]`): usar los tokens de `src/styles.css`, incluidos
   los «colores de apoyo». Para un color nuevo, crear el token allí.
5. Para animar, preferir `transform` y `opacity` y las curvas `ease-*` de M3.
6. Controles nuevos con forma (botón de icono, opción, pestaña, tarjeta seleccionable): añadir la clase `ripple`.
7. Botones de icono: `size-10` + `touch-target` + `aria-label` + `data-tooltip`.
8. Modales nuevos: usar `app-dialog`, `app-drawer` o `app-confirm-dialog` (traen foco, salida animada y `bg-scrim`).

## Verificación de colores

**Cambios de color autorizados** (respecto de `main`):

| Cambio                                 | Antes                      | Después                            | Motivo                                     |
| -------------------------------------- | -------------------------- | ---------------------------------- | ------------------------------------------ |
| Sombra ambiental de botones            | —                          | `rgba(14, 42, 92, 0.15)`           | Elevación de Material                      |
| Halo del foco de campos                | `rgba(22, 104, 227, 0.14)` | eliminado                          | A pedido                                   |
| `--color-faint` (íconos y separadores) | `#a0a8b6` (2,4:1)          | `#828c9f` (3,4:1)                  | Contraste mínimo de elementos no textuales |
| Texto de ejemplo de campos             | `#8a93a3` (3,1:1)          | `--color-subtle` `#6b7588` (4,6:1) | Contraste de texto                         |
| Textos que usaban `faint` / `#8a93a3`  | idem                       | `text-subtle`                      | Contraste de texto                         |
| Fondo de modales                       | 45 %, 50 % y 55 %          | `--color-scrim` 32 %               | Opacidad de M3, unificada                  |

Los 89 colores sueltos de las plantillas pasaron a tokens con nombre en `src/styles.css` («Colores de apoyo») **con el
mismo valor**; 15 coincidían con tokens existentes y se reemplazaron por ellos.

Detalle de la verificación automática:

Antes y después del cambio se extrajeron (1) todos los literales de color del código (`#hex`, `rgb[a]()`, `hsl()`,
`oklch()`), (2) las clases de color de Tailwind usadas en plantillas y (3) los colores del CSS compilado:

- El conjunto de literales de color es **idéntico** salvo una excepción autorizada: `rgba(14, 42, 92, 0.15)`, la sombra
  ambiental de la elevación de botones. Ningún color existente se modificó. Se eliminó, a pedido, el halo celeste del
  foco de los campos (`rgba(22, 104, 227, 0.14)`), que solo se usaba en ese efecto. Además cambia cuántas veces se
  repite un mismo `rgba()`, porque las sombras M3 tienen dos capas del mismo color.
- Las clases de color de Tailwind no cambian, salvo `border-primary`/`focus:border-primary` en cinco controles, que
  pasan a `field-focus-ring` (mismo `--color-primary`).
- En el CSS compilado el conjunto de colores es el mismo, más la sombra autorizada y menos el halo eliminado.
  `docs/` queda fuera del escaneo de Tailwind
  (`@source not`) para que las clases citadas aquí no generen CSS.

## Accesibilidad

- Contraste: texto de ejemplo y textos secundarios del calendario a ≥ 4,5:1; íconos decorativos a ≥ 3:1.
- Foco visible reforzado en campos y elementos interactivos; navegación por teclado sin cambios.
- Movimiento reducido respetado.
- Foco atrapado y restaurado en modales; tooltips accesibles con teclado; áreas táctiles de 48 px.
- Pendiente: `text-subtle` sobre el fondo `bg-page` da 4,2:1; revisar si se usa como texto sobre ese fondo.
