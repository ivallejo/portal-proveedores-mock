/** Cambios de datos personales: la razón social o los nombres y apellidos. */
export interface UpdateProfileCommand {
  businessName?: string;
  firstName?: string;
  lastName?: string;
}
