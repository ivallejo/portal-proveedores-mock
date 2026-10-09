import { PersonalDataField } from './personal-data-field';

/** Mensaje de error por campo de los datos personales. */
export type PersonalDataErrors = Partial<Record<PersonalDataField, string>>;
