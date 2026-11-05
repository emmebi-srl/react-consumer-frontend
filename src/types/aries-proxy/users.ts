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

/** Same ids as the ARIES_MODULE_* constants of the Delphi ModuleManager. */
export const AriesModule = {
  Customers: 1,
  Products: 2,
  Reports: 4,
  Ddts: 6,
  Quotes: 9,
  Systems: 10,
  SupplierInvoices: 12,
  Emails: 22,
  Settings: 47,
} as const;

export interface UserModulePermission {
  moduleId: number;
  isEnabled: boolean;
  canInsert: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPrint: boolean;
  canDocuments: boolean;
  canPrices: boolean;
  canTotals: boolean;
  canSignatures: boolean;
}

export interface UserModulePermissionsResponse {
  permissions: UserModulePermission[];
}
