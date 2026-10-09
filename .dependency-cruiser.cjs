/**
 * Reglas de arquitectura del frontend (docs/PLAN_HEXAGONAL.md, sección 3).
 * `npm run arch` las verifica y `npm run quality` las incluye.
 *
 * Los paquetes de npm se comparan por su ruta resuelta (`node_modules/...`).
 * Las reglas por capa se aplican a todas las features (`src/app/features/<feature>/<capa>/`).
 */
const APP = '^src/app';
const layer = (name) => `${APP}/features/[^/]+/${name}/`;

module.exports = {
  forbidden: [
    {
      name: 'domain-is-pure',
      comment: 'El dominio no depende de Angular, RxJS ni de otras capas.',
      severity: 'error',
      from: { path: layer('domain') },
      to: {
        path: [
          '^node_modules/@angular/',
          '^node_modules/rxjs/',
          `${APP}/features/[^/]+/(application|infrastructure|presentation|di)/`,
          `${APP}/(core|shared)/`,
          '^src/environments/',
        ],
      },
    },
    {
      name: 'application-has-no-adapters',
      comment:
        'La aplicación solo conoce su dominio y sus puertos: nada de HTTP, adaptadores, pantallas ni environment.',
      severity: 'error',
      from: { path: layer('application') },
      to: {
        path: [
          '^node_modules/@angular/common/http/',
          '^node_modules/@angular/router/',
          `${APP}/features/[^/]+/(infrastructure|presentation|di)/`,
          `${APP}/core/`,
          '^src/environments/',
        ],
      },
    },
    {
      name: 'presentation-uses-ports-not-adapters',
      comment:
        'Las pantallas llegan a los casos de uso por los tokens de di/, nunca por un adaptador.',
      severity: 'error',
      from: { path: layer('presentation') },
      to: { path: `${APP}/features/[^/]+/infrastructure/` },
    },
    {
      name: 'only-interceptors-know-http',
      comment:
        'En presentación, solo los interceptores (parte del pipeline HTTP) usan @angular/common/http.',
      severity: 'error',
      from: {
        path: layer('presentation'),
        pathNot: `${APP}/features/[^/]+/presentation/interceptors/`,
      },
      to: { path: '^node_modules/@angular/common/http/' },
    },
    {
      name: 'infrastructure-does-not-know-presentation',
      severity: 'error',
      from: { path: layer('infrastructure') },
      to: { path: `${APP}/features/[^/]+/presentation/` },
    },
    {
      name: 'features-talk-through-public-api',
      comment: 'Otra feature solo se importa por su index.ts.',
      severity: 'error',
      from: { path: `${APP}/features/([^/]+)/` },
      to: {
        path: `${APP}/features/[^/]+/`,
        pathNot: [`${APP}/features/$1/`, `${APP}/features/[^/]+/index\\.ts$`],
      },
    },
    {
      name: 'core-uses-feature-public-api',
      comment:
        'core compone la app con la API pública de las features (index.ts), nunca con sus archivos internos.',
      severity: 'error',
      from: { path: `${APP}/core/` },
      to: { path: `${APP}/features/[^/]+/`, pathNot: `${APP}/features/[^/]+/index\\.ts$` },
    },
    {
      name: 'app-uses-feature-public-api',
      comment: 'La composición de la app (app.config.ts, app.routes.ts) usa solo la API pública.',
      severity: 'error',
      from: { path: `${APP}/[^/]+\\.ts$` },
      to: { path: `${APP}/features/[^/]+/`, pathNot: `${APP}/features/[^/]+/index\\.ts$` },
    },
    {
      name: 'no-circular',
      comment: 'Ningún ciclo de dependencias en toda la aplicación.',
      severity: 'error',
      from: { path: `${APP}/` },
      to: { circular: true },
    },
    {
      name: 'shared-is-independent',
      comment: 'shared no depende de core ni de features.',
      severity: 'error',
      from: { path: `${APP}/shared/` },
      to: { path: [`${APP}/core/`, `${APP}/features/`] },
    },
    {
      name: 'environment-only-in-config',
      comment:
        'El environment se lee solo en core/config (tipos) y en app.config.ts, que provee API_BASE_URL y FEATURE_FLAGS.',
      severity: 'error',
      from: { pathNot: [`${APP}/core/config/`, `${APP}/app\\.config\\.ts$`] },
      to: { path: '^src/environments/' },
    },
    {
      name: 'no-orphans',
      comment: 'Ningún archivo sin usar: todo archivo de src/app lo importa alguien.',
      severity: 'error',
      from: {
        orphan: true,
        pathNot: ['\\.d\\.ts$', '^src/main\\.ts$', '^src/environments/'],
      },
      to: {},
    },
    {
      name: 'not-to-unresolvable',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '\\.spec\\.ts$' },
    tsConfig: { fileName: 'tsconfig.app.json' },
    tsPreCompilationDeps: true,
  },
};
