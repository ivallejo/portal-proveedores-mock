import { NavigationItem } from '../models/navigation-item';

/** Rutas que el usuario puede abrir: las de sus opciones y submenús. */
export function routesOf(items: readonly NavigationItem[]): Set<string> {
  return new Set(
    items
      .flatMap((item) => [item, ...item.children])
      .flatMap((item) => (item.route ? [item.route] : [])),
  );
}

/** La ruta (o una de sus subrutas) está entre las del menú. */
export function allowsPath(routes: ReadonlySet<string>, path: string): boolean {
  return [...routes].some((route) => path === route || path.startsWith(`${route}/`));
}
