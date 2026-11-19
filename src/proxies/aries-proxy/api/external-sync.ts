import ariesServicesClient from '~/clients/aries-services-client';
import {
  ExternalSyncConfiguration,
  ExternalSyncConfigurationSave,
  ExternalSyncProvider,
  ExternalSyncTestResult,
} from '~/types/aries-proxy/external-sync';

// Admin only (`aries_admin`).
const BASE = 'external-sync';

export const getExternalSyncConfiguration = (provider: ExternalSyncProvider) =>
  ariesServicesClient.get<ExternalSyncConfiguration>(`${BASE}/${provider}`);

export const saveExternalSyncConfiguration = (provider: ExternalSyncProvider, model: ExternalSyncConfigurationSave) =>
  ariesServicesClient.put<ExternalSyncConfiguration>(`${BASE}/${provider}`, model);

export const testExternalSyncConnection = (provider: ExternalSyncProvider) =>
  ariesServicesClient.post<ExternalSyncTestResult>(`${BASE}/${provider}/test`);
