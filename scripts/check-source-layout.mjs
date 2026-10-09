// Reglas 6 y 7 de docs/PLAN_HEXAGONAL.md para todo src/app:
// - un tipo por archivo, plantillas en .html y ningún archivo como script global;
// - cada feature tiene solo su index.ts, su <feature>.routes.ts y las carpetas de sus capas, con sus subcarpetas.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'src/app';
const FEATURES = join(ROOT, 'features');

/** Subcarpetas permitidas por capa (`null`: libre, p. ej. una por tecnología en infrastructure). */
const LAYERS = {
  domain: ['models', 'rules', 'errors'],
  application: ['models', 'ports', 'use-cases'],
  infrastructure: null,
  di: [],
  presentation: ['pages', 'components', 'facades', 'catalog', 'guards', 'interceptors', 'browser'],
};

const TYPE =
  /^(?:export\s+)?(?:default\s+)?(?:declare\s+)?(?:abstract\s+)?(class|interface|type|enum)\s+(\w+)/gm;
const MODULE = /^(import|export)\s/m;

const files = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return path.endsWith('.ts') && !path.endsWith('.spec.ts') ? [path] : [];
  });
const dirs = (dir) => readdirSync(dir).filter((name) => statSync(join(dir, name)).isDirectory());

const sourceProblems = files(ROOT).flatMap((path) => {
  const text = readFileSync(path, 'utf8');
  const found = [];
  const types = [...text.matchAll(TYPE)].map((match) => match[2]);
  if (types.length > 1) found.push(`declara ${types.length} tipos (${types.join(', ')})`);
  if (/^\s*template:\s*`/m.test(text)) found.push('tiene la plantilla inline (usar templateUrl)');
  if (!MODULE.test(text))
    found.push('no importa ni exporta nada (TypeScript lo trata como script global)');
  return found.map((problem) => `${path}: ${problem}`);
});

const layoutProblems = dirs(FEATURES).flatMap((feature) => {
  const base = join(FEATURES, feature);
  const found = [];
  if (!existsSync(join(base, 'index.ts'))) found.push(`${base}: falta index.ts (API pública)`);
  for (const name of readdirSync(base)) {
    const path = join(base, name);
    if (statSync(path).isDirectory()) {
      if (!(name in LAYERS)) {
        found.push(`${path}: carpeta fuera de las capas (${Object.keys(LAYERS).join(', ')})`);
        continue;
      }
      const allowed = LAYERS[name];
      for (const sub of allowed ? dirs(path) : []) {
        if (!allowed.includes(sub))
          found.push(
            `${join(path, sub)}: subcarpeta no permitida en ${name} (${allowed.join(', ') || 'ninguna'})`,
          );
      }
      const ports = join(path, 'ports');
      if (name === 'application' && existsSync(ports)) {
        for (const sub of dirs(ports))
          if (!['in', 'out'].includes(sub))
            found.push(`${join(ports, sub)}: los puertos van en in/ u out/`);
      }
    } else if (!['index.ts', `${feature}.routes.ts`].includes(name) && !name.endsWith('.spec.ts')) {
      found.push(`${path}: en la raíz de la feature solo van index.ts y ${feature}.routes.ts`);
    }
  }
  return found;
});

const problems = [...sourceProblems, ...layoutProblems];
if (problems.length) {
  console.error(`✘ ${problems.length} problema(s) de estructura:\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(
  `✔ estructura de archivos correcta (${files(ROOT).length} archivos y ${dirs(FEATURES).length} features revisados)`,
);
