/**
 * Reglas de arquitectura del frontend (docs/PLAN_HEXAGONAL.md, sección 3).
 * `npm run arch` las verifica y `npm run quality` las incluye.
 *
 * Las reglas por capa se aplican a las features ya migradas a la estructura hexagonal (MIGRATED_FEATURES);
 * cada paso del plan agrega la feature que migra. Al terminar, la lista cubre todas las features.
 */
const MIGRATED_FEATURES = [];

const APP = '^src/app';
const migrated = MIGRATED_FEATURES.length ? `(${MIGRATED_FEATURES.join('|')})` : '(?!)';
const layer = (name) => `${APP}/features/${migrated}/${name}/`;

module.exports = {
  forbidden: [
    {
      name: 'domain-is-pure',
      comment: 'El dominio no depende de Angular, RxJS ni de otras capas.',
      severity: 'error',
      from: { path: layer('domain') },
      to: {
        path: [
          '^@angular',
          '^rxjs',
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
          '^@angular/common/http',
          '^@angular/router',
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
      to: { path: [`${APP}/features/[^/]+/infrastructure/`, '^@angular/common/http$'] },
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
      from: { path: `${APP}/features/${migrated}/` },
      to: {
        path: `${APP}/features/[^/]+/`,
        pathNot: [`${APP}/features/$1/`, `${APP}/features/[^/]+/index\\.ts$`],
      },
    },
    {
      name: 'no-cycles-in-migrated-features',
      severity: 'error',
      from: { path: `${APP}/features/${migrated}/` },
      to: { circular: true },
    },
    {
      name: 'shared-is-independent',
      comment: 'shared no depende de core ni de features.',
      severity: 'error',
      // Pendientes de migrar: shared/data pasa a la feature catalog (paso 11) y shared/documents a documents (paso 13).
      from: { path: `${APP}/shared/`, pathNot: `${APP}/shared/(data|documents)/` },
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
