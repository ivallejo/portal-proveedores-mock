/** Datos de alta o edición de un área: sus sociedades (al menos una), nombre y descripción. */
export interface SaveAreaCommand {
  societyIds: string[];
  name: string;
  description: string;
}
