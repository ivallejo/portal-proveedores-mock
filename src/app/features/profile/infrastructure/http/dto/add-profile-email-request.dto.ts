export interface AddProfileEmailRequestDto {
  email: string;
  type: 'work' | 'billing' | 'personal';
}
