export function areaSocietiesError(societyIds: readonly string[]): string | undefined {
  return societyIds.length ? undefined : 'Selecciona al menos una sociedad.';
}

export function areaNameError(name: string): string | undefined {
  return name.trim() ? undefined : 'Ingresa el nombre del área.';
}

export function areaDescriptionError(description: string): string | undefined {
  return description.length > 300 ? 'Máximo 300 caracteres.' : undefined;
}
