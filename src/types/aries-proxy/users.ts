export type UserRole = 'aries_mobile_admin' | 'aries_admin';

export interface UsersResponse {
  users: User[];
}

export interface User {
  id: number;
  username: string;
  password: string | null;
  salt: string | null;
  description: string | null;
  email: string;
  signature: string;
  calendarId: number;
  smtpHost: string;
  smtpPort: number;
  useSsl: boolean;
  emailUsername: string;
  emailPassword: string;
  userTypeId: number;
  userType: string;
  hasConfirmationOfReading: boolean;
  roles: UserRole[];
}
