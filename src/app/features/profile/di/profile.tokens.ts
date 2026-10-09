import { InjectionToken } from '@angular/core';
import { AddProfileEmailPort } from '../application/ports/in/add-profile-email.port';
import { GetProfilePort } from '../application/ports/in/get-profile.port';
import { MakePrimaryEmailPort } from '../application/ports/in/make-primary-email.port';
import { RemoveProfileEmailPort } from '../application/ports/in/remove-profile-email.port';
import { ResendEmailVerificationPort } from '../application/ports/in/resend-email-verification.port';
import { UpdateProfilePort } from '../application/ports/in/update-profile.port';
import { VerifyEmailPort } from '../application/ports/in/verify-email.port';
import { EmailVerificationGatewayPort } from '../application/ports/out/email-verification-gateway.port';
import { ProfileRepositoryPort } from '../application/ports/out/profile-repository.port';

export const GET_PROFILE = new InjectionToken<GetProfilePort>('GET_PROFILE');
export const UPDATE_PROFILE = new InjectionToken<UpdateProfilePort>('UPDATE_PROFILE');
export const ADD_PROFILE_EMAIL = new InjectionToken<AddProfileEmailPort>('ADD_PROFILE_EMAIL');
export const RESEND_EMAIL_VERIFICATION = new InjectionToken<ResendEmailVerificationPort>(
  'RESEND_EMAIL_VERIFICATION',
);
export const MAKE_PRIMARY_EMAIL = new InjectionToken<MakePrimaryEmailPort>('MAKE_PRIMARY_EMAIL');
export const REMOVE_PROFILE_EMAIL = new InjectionToken<RemoveProfileEmailPort>(
  'REMOVE_PROFILE_EMAIL',
);
export const VERIFY_EMAIL = new InjectionToken<VerifyEmailPort>('VERIFY_EMAIL');
export const PROFILE_REPOSITORY = new InjectionToken<ProfileRepositoryPort>('PROFILE_REPOSITORY');
export const EMAIL_VERIFICATION_GATEWAY = new InjectionToken<EmailVerificationGatewayPort>(
  'EMAIL_VERIFICATION_GATEWAY',
);
