// API pública de la feature societies: lo único que otras features pueden importar.
export type { Society } from './domain/models/society';
export type { GetSocietiesPort } from './application/ports/in/get-societies.port';
export { GET_SOCIETIES } from './di/societies.tokens';
export { SOCIETIES_PROVIDERS } from './di/societies.providers';
export { SOCIETIES_ROUTES } from './societies.routes';
