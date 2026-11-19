import { useMutation, useQuery } from '@tanstack/react-query';
import queryClient from '~/clients/query-client';
import useExceptionLogger from '~/hooks/useExceptionLogger';
import { ExternalSyncConfigurationSave, ExternalSyncProvider } from '~/types/aries-proxy/external-sync';
import {
  getExternalSyncConfiguration,
  saveExternalSyncConfiguration,
  testExternalSyncConnection,
} from './api/external-sync';

export const ExternalSyncQueryKeys = {
  all: ['external-sync'] as const,
  configuration: (provider: ExternalSyncProvider) => ['external-sync', provider] as const,
};

/** Refreshed every minute: the Windows service writes the result of each run (every 5 minutes). */
export const useExternalSyncConfiguration = (provider: ExternalSyncProvider) =>
  useQuery({
    queryKey: ExternalSyncQueryKeys.configuration(provider),
    queryFn: async () => (await getExternalSyncConfiguration(provider)).data,
    refetchInterval: 60_000,
  });

export const useSaveExternalSyncConfiguration = (provider: ExternalSyncProvider) => {
  const exceptionLogger = useExceptionLogger();
  return useMutation({
    mutationFn: async (model: ExternalSyncConfigurationSave) =>
      (await saveExternalSyncConfiguration(provider, model)).data,
    onSuccess: (data) => queryClient.setQueryData(ExternalSyncQueryKeys.configuration(provider), data),
    onError: (err) => exceptionLogger.captureException(err),
  });
};

/** A failed test answers 400 with the reason: show it with `getApiErrorMessage`. */
export const useTestExternalSyncConnection = (provider: ExternalSyncProvider) =>
  useMutation({
    mutationFn: async () => (await testExternalSyncConnection(provider)).data,
  });
