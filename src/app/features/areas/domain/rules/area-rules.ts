export function areaSocietyError(societyId: string): string | undefined {
  return societyId ? undefined : 'Selecciona la sociedad.';
}

export function areaNameError(name: string): string | undefined {
  return name.trim() ? undefined : 'Ingresa el nombre del área.';
}

export function areaDescriptionError(description: string): string | undefined {
  return description.length > 300 ? 'Máximo 300 caracteres.' : undefined;
}
