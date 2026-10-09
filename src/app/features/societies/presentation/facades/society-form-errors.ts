import { SaveSocietyCommand } from '../../application/models/save-society.command';

/** Error de cada campo del formulario de sociedad. */
export type SocietyFormErrors = Partial<Record<keyof SaveSocietyCommand, string>>;
