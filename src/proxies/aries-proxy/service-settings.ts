import { useMutation, useQuery } from '@tanstack/react-query';
import queryClient from '~/clients/query-client';
import useExceptionLogger from '~/hooks/useExceptionLogger';
import {
  CustomerReminderConfigList,
  CustomerReminderConfigUpdate,
  CustomerReminderGeneralConfig,
  ServiceAlertConfigList,
  ServiceAlertConfigUpdate,
  ServiceAlertGeneralConfig,
} from '~/types/aries-proxy/service-settings';
import {
  addServiceAlertRecipient,
  deleteServiceAlertRecipient,
  getCustomerReminderCampaigns,
  getCustomerReminderGeneralConfig,
  getCustomerReminderPlaceholders,
  getCustomerReminders,
  getServiceAlertGeneralConfig,
  getServiceAlertRecipients,
  getServiceAlerts,
  saveCustomerReminder,
  saveCustomerReminderGeneralConfig,
  saveServiceAlert,
  saveServiceAlertGeneralConfig,
  saveServiceAlertRecipient,
} from './api/service-settings';

export const ServiceSettingsQueryKeys = {
  all: ['service-settings'] as const,
  alertGeneral: ['service-settings', 'alert', 'general'] as const,
  alerts: ['service-settings', 'alert'] as const,
  alertRecipients: (serviceId: number) => ['service-settings', 'alert', serviceId, 'recipients'] as const,
  reminderGeneral: ['service-settings', 'customer-reminder', 'general'] as const,
  reminders: ['service-settings', 'customer-reminder'] as const,
  reminderPlaceholders: (id: number) => ['service-settings', 'customer-reminder', id, 'placeholders'] as const,
  reminderCampaigns: (id: number) => ['service-settings', 'customer-reminder', id, 'campaigns'] as const,
};

// Internal alerts

export const useServiceAlertGeneralConfig = () =>
  useQuery({
    queryKey: ServiceSettingsQueryKeys.alertGeneral,
    queryFn: async () => (await getServiceAlertGeneralConfig()).data,
  });

export const useSaveServiceAlertGeneralConfig = () => {
  const exceptionLogger = useExceptionLogger();
  return useMutation({
    mutationFn: async (model: ServiceAlertGeneralConfig) => (await saveServiceAlertGeneralConfig(model)).data,
    onSuccess: (data) => queryClient.setQueryData(ServiceSettingsQueryKeys.alertGeneral, data),
    onError: (err) => exceptionLogger.captureException(err),
  });
};

export const useServiceAlerts = () =>
  useQuery({
    queryKey: ServiceSettingsQueryKeys.alerts,
    queryFn: async () => (await getServiceAlerts()).data,
  });

export const useSaveServiceAlert = () => {
  const exceptionLogger = useExceptionLogger();
  return useMutation({
    mutationFn: async ({ id, model }: { id: number; model: ServiceAlertConfigUpdate }) =>
      (await saveServiceAlert(id, model)).data,
    onSuccess: (saved) =>
      queryClient.setQueryData<ServiceAlertConfigList>(ServiceSettingsQueryKeys.alerts, (current) =>
        current ? { services: current.services.map((item) => (item.id === saved.id ? saved : item)) } : current,
      ),
    onError: (err, data) => exceptionLogger.captureException(err, { extra: { data } }),
  });
};

export const useServiceAlertRecipients = (serviceId: number | null) =>
  useQuery({
    queryKey: ServiceSettingsQueryKeys.alertRecipients(serviceId ?? 0),
    queryFn: async () => (await getServiceAlertRecipients(serviceId ?? 0)).data,
    enabled: !!serviceId,
  });

type RecipientMutation =
  | { action: 'add'; serviceId: number; email: string }
  | { action: 'edit'; serviceId: number; recipientId: number; email: string }
  | { action: 'delete'; serviceId: number; recipientId: number };

export const useMutateServiceAlertRecipient = () => {
  const exceptionLogger = useExceptionLogger();
  return useMutation({
    mutationFn: async (mutation: RecipientMutation) => {
      switch (mutation.action) {
        case 'add':
          return (await addServiceAlertRecipient(mutation.serviceId, mutation.email)).data;
        case 'edit':
          return (await saveServiceAlertRecipient(mutation.serviceId, mutation.recipientId, mutation.email)).data;
        case 'delete':
          return (await deleteServiceAlertRecipient(mutation.serviceId, mutation.recipientId)).data;
      }
    },
    onSuccess: (data, mutation) =>
      queryClient.setQueryData(ServiceSettingsQueryKeys.alertRecipients(mutation.serviceId), data),
    onError: (err, data) => exceptionLogger.captureException(err, { extra: { data } }),
  });
};

// Customer reminders

export const useCustomerReminderGeneralConfig = () =>
  useQuery({
    queryKey: ServiceSettingsQueryKeys.reminderGeneral,
    queryFn: async () => (await getCustomerReminderGeneralConfig()).data,
  });

export const useSaveCustomerReminderGeneralConfig = () => {
  const exceptionLogger = useExceptionLogger();
  return useMutation({
    mutationFn: async (model: CustomerReminderGeneralConfig) => (await saveCustomerReminderGeneralConfig(model)).data,
    onSuccess: (data) => queryClient.setQueryData(ServiceSettingsQueryKeys.reminderGeneral, data),
    onError: (err) => exceptionLogger.captureException(err),
  });
};

export const useCustomerReminders = () =>
  useQuery({
    queryKey: ServiceSettingsQueryKeys.reminders,
    queryFn: async () => (await getCustomerReminders()).data,
  });

export const useSaveCustomerReminder = () => {
  const exceptionLogger = useExceptionLogger();
  return useMutation({
    mutationFn: async ({ id, model }: { id: number; model: CustomerReminderConfigUpdate }) =>
      (await saveCustomerReminder(id, model)).data,
    onSuccess: (saved) =>
      queryClient.setQueryData<CustomerReminderConfigList>(ServiceSettingsQueryKeys.reminders, (current) =>
        current ? { reminders: current.reminders.map((item) => (item.id === saved.id ? saved : item)) } : current,
      ),
    onError: (err, data) => exceptionLogger.captureException(err, { extra: { data } }),
  });
};

export const useCustomerReminderPlaceholders = (id: number | null) =>
  useQuery({
    queryKey: ServiceSettingsQueryKeys.reminderPlaceholders(id ?? 0),
    queryFn: async () => (await getCustomerReminderPlaceholders(id ?? 0)).data,
    enabled: !!id,
  });

export const useCustomerReminderCampaigns = (id: number | null, enabled: boolean) =>
  useQuery({
    queryKey: ServiceSettingsQueryKeys.reminderCampaigns(id ?? 0),
    queryFn: async () => (await getCustomerReminderCampaigns(id ?? 0)).data,
    enabled: !!id && enabled,
  });
