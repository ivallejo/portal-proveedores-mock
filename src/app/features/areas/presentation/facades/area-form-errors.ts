import { SaveAreaCommand } from '../../application/models/save-area.command';

/** Error de cada campo del formulario de área. */
export type AreaFormErrors = Partial<Record<keyof SaveAreaCommand, string>>;
