import { UserFormField } from './user-form-field';

/** Errores del formulario: los campos de Datos, los correos y las sociedades. */
export type UserFormErrors = Partial<Record<UserFormField | 'emails' | 'companies', string>>;
