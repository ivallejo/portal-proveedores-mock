import { MenuForm } from './menu-form';

/** Error de cada campo del formulario de opción del menú. */
export type MenuFormErrors = Partial<Record<Exclude<keyof MenuForm, 'isActive'>, string>>;
