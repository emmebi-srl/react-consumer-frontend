/** Same values as the backend `ExternalSyncProvider`. */
export const ExternalSyncProvider = {
  Google: 'google',
} as const;

export type ExternalSyncProvider = (typeof ExternalSyncProvider)[keyof typeof ExternalSyncProvider];

/** Ticket sync with an external task provider (`api/external-sync/{provider}`). The key itself is never returned. */
export interface ExternalSyncConfiguration {
  provider: ExternalSyncProvider;
  isEnabled: boolean;
  hasCredentials: boolean;
  /** `client_email` of the saved service account key. */
  serviceAccountEmail: string | null;
  /** False when the server has no `Secrets:EncryptionKey`: a key can't be saved. */
  isEncryptionConfigured: boolean;
  defaultUserId: number | null;
  /** Email of the default user: the Google Workspace account that receives the tasks. */
  defaultUserEmail: string | null;
  closingStatusId: number | null;
  taskListName: string;
  pastExpirationDays: number;
  /** Unix seconds. */
  lastExecutionDate: number | null;
  /** Unix seconds. */
  lastSuccessDate: number | null;
  lastError: string | null;
  /** Open tasks on the provider after the last run. */
  syncedTaskCount: number;
}

export interface ExternalSyncConfigurationSave {
  isEnabled: boolean;
  /** Content of the JSON key file, as a string; null keeps the saved key. */
  serviceAccountJson: string | null;
  defaultUserId: number | null;
  closingStatusId: number | null;
  taskListName: string;
  pastExpirationDays: number;
}

export interface ExternalSyncTestResult {
  message: string;
}
