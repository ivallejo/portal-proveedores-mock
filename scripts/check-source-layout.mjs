// Regla 7 de docs/PLAN_HEXAGONAL.md: un tipo por archivo, plantillas en .html y ningún archivo como script global.
// Se aplica a las carpetas ya migradas (CHECKED); cada paso del plan agrega las suyas.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const CHECKED = [
  'src/app/core/config',
  'src/app/core/http',
  'src/app/core/layout',
  'src/app/shared/errors',
  'src/app/shared/ui',
  'src/app/shared/utils',
  'src/app/features/societies',
  'src/app/features/areas',
  'src/app/features/auth',
  'src/app/features/menus',
  'src/app/features/roles',
  'src/app/features/users',
  'src/app/features/profile',
  'src/app/features/catalog',
  'src/app/features/payments',
  'src/app/features/documents',
];

const TYPE =
  /^(?:export\s+)?(?:default\s+)?(?:declare\s+)?(?:abstract\s+)?(class|interface|type|enum)\s+(\w+)/gm;
const MODULE = /^(import|export)\s/m;

const files = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return path.endsWith('.ts') && !path.endsWith('.spec.ts') ? [path] : [];
  });

const problems = CHECKED.flatMap(files).flatMap((path) => {
  const text = readFileSync(path, 'utf8');
  const found = [];
  const types = [...text.matchAll(TYPE)].map((match) => match[2]);
  if (types.length > 1) found.push(`declara ${types.length} tipos (${types.join(', ')})`);
  if (/^\s*template:\s*`/m.test(text)) found.push('tiene la plantilla inline (usar templateUrl)');
  if (!MODULE.test(text))
    found.push('no importa ni exporta nada (TypeScript lo trata como script global)');
  return found.map((problem) => `${path}: ${problem}`);
});

if (problems.length) {
  console.error(`✘ ${problems.length} problema(s) de estructura:\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(
  `✔ estructura de archivos correcta (${CHECKED.flatMap(files).length} archivos revisados)`,
);
