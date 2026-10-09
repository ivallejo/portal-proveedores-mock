import { Provider, inject } from '@angular/core';
import { AddProfileEmailUseCase } from '../application/use-cases/add-profile-email.use-case';
import { GetProfileUseCase } from '../application/use-cases/get-profile.use-case';
import { MakePrimaryEmailUseCase } from '../application/use-cases/make-primary-email.use-case';
import { RemoveProfileEmailUseCase } from '../application/use-cases/remove-profile-email.use-case';
import { ResendEmailVerificationUseCase } from '../application/use-cases/resend-email-verification.use-case';
import { UpdateProfileUseCase } from '../application/use-cases/update-profile.use-case';
import { VerifyEmailUseCase } from '../application/use-cases/verify-email.use-case';
import { EmailVerificationHttpAdapter } from '../infrastructure/http/email-verification-http.adapter';
import { ProfileHttpAdapter } from '../infrastructure/http/profile-http.adapter';
import {
  ADD_PROFILE_EMAIL,
  EMAIL_VERIFICATION_GATEWAY,
  GET_PROFILE,
  MAKE_PRIMARY_EMAIL,
  PROFILE_REPOSITORY,
  REMOVE_PROFILE_EMAIL,
  RESEND_EMAIL_VERIFICATION,
  UPDATE_PROFILE,
  VERIFY_EMAIL,
} from './profile.tokens';

/** Mi perfil: enlaza cada puerto con su caso de uso y el adaptador HTTP. */
export const PROFILE_PROVIDERS: Provider[] = [
  { provide: PROFILE_REPOSITORY, useClass: ProfileHttpAdapter },
  { provide: GET_PROFILE, useFactory: () => new GetProfileUseCase(inject(PROFILE_REPOSITORY)) },
  {
    provide: UPDATE_PROFILE,
    useFactory: () => new UpdateProfileUseCase(inject(PROFILE_REPOSITORY)),
  },
  {
    provide: ADD_PROFILE_EMAIL,
    useFactory: () => new AddProfileEmailUseCase(inject(PROFILE_REPOSITORY)),
  },
  {
    provide: RESEND_EMAIL_VERIFICATION,
    useFactory: () => new ResendEmailVerificationUseCase(inject(PROFILE_REPOSITORY)),
  },
  {
    provide: MAKE_PRIMARY_EMAIL,
    useFactory: () => new MakePrimaryEmailUseCase(inject(PROFILE_REPOSITORY)),
  },
  {
    provide: REMOVE_PROFILE_EMAIL,
    useFactory: () => new RemoveProfileEmailUseCase(inject(PROFILE_REPOSITORY)),
  },
];

/** Verificación de correo: la página pública del enlace solo necesita este caso de uso. */
export const EMAIL_VERIFICATION_PROVIDERS: Provider[] = [
  { provide: EMAIL_VERIFICATION_GATEWAY, useClass: EmailVerificationHttpAdapter },
  {
    provide: VERIFY_EMAIL,
    useFactory: () => new VerifyEmailUseCase(inject(EMAIL_VERIFICATION_GATEWAY)),
  },
];
