export interface ProfileEmailResponseDto {
  id: string;
  email: string;
  type: 'work' | 'billing' | 'personal';
  isPrimary: boolean;
  isVerified: boolean;
  createdAtUtc: string;
}
