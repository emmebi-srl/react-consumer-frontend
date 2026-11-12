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

/**
 * A user of the web user management and profile (`api/user-account`, `api/user/me/account`).
 * Unlike `User` (legacy `api/user`, shared with the Android app) it never carries password hash, salt or email password.
 */
export interface UserAccount {
  id: number;
  username: string;
  description: string | null;
  email: string | null;
  signature: string | null;
  smtpHost: string | null;
  smtpPort: number | null;
  useSsl: boolean;
  emailUsername: string | null;
  /** The email password is write-only: this only tells whether one is stored. */
  hasEmailPassword: boolean;
  hasConfirmationOfReading: boolean;
  userTypeId: number;
  userType: string;
  roleIds: number[];
  roles: string[];
  passkeyCount: number;
}

export interface UserAccountListResponse {
  users: UserAccount[];
}

/** Email settings, shared by the profile and the administrator editor. Empty email password = keep the stored one. */
export interface UserEmailSettingsRequest {
  description: string;
  email: string;
  signature: string;
  smtpHost: string;
  smtpPort: number | null;
  useSsl: boolean;
  emailUsername: string;
  emailPassword: string;
  hasConfirmationOfReading: boolean;
}

export type UserProfileSaveRequest = UserEmailSettingsRequest;

export interface UserAccountSaveRequest extends UserEmailSettingsRequest {
  username: string;
  /** Required on create; on update empty keeps the current password. */
  password: string;
  userTypeId: number;
  roleIds: number[];
}

export interface UserPasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserType {
  id: number;
  name: string;
  description: string;
}

export interface UserRoleOption {
  id: number;
  name: string;
  description: string;
  /** e.g. `aries_admin`, the value of `User.roles`. */
  appName: string;
}

export interface UserPasskey {
  id: number;
  name: string;
  /** Synced passkey (iCloud Keychain, Google Password Manager, ...). */
  isBackedUp: boolean;
  createdAt: number;
  lastUsedAt: number | null;
}

export interface UserPasskeyListResponse {
  passkeys: UserPasskey[];
}

/** WebAuthn options as a JSON string: the client would rename the WebAuthn keys if they were a JSON object. */
export interface PasskeyCeremony {
  ceremonyId: string;
  optionsJson: string;
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
