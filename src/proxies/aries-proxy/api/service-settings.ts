import ariesServicesClient from '~/clients/aries-services-client';
import {
  CustomerReminderCampaignList,
  CustomerReminderConfig,
  CustomerReminderConfigList,
  CustomerReminderConfigUpdate,
  CustomerReminderGeneralConfig,
  CustomerReminderPlaceholderList,
  ServiceAlertConfig,
  ServiceAlertConfigList,
  ServiceAlertConfigUpdate,
  ServiceAlertGeneralConfig,
  ServiceAlertRecipientList,
} from '~/types/aries-proxy/service-settings';

const BASE = 'service-settings';

// Internal alerts

export const getServiceAlertGeneralConfig = () =>
  ariesServicesClient.get<ServiceAlertGeneralConfig>(`${BASE}/alert/general`);

export const saveServiceAlertGeneralConfig = (model: ServiceAlertGeneralConfig) =>
  ariesServicesClient.put<ServiceAlertGeneralConfig>(`${BASE}/alert/general`, model);

export const getServiceAlerts = () => ariesServicesClient.get<ServiceAlertConfigList>(`${BASE}/alert`);

export const saveServiceAlert = (id: number, model: ServiceAlertConfigUpdate) =>
  ariesServicesClient.put<ServiceAlertConfig>(`${BASE}/alert/${id}`, model);

export const getServiceAlertRecipients = (serviceId: number) =>
  ariesServicesClient.get<ServiceAlertRecipientList>(`${BASE}/alert/${serviceId}/recipient`);

export const addServiceAlertRecipient = (serviceId: number, email: string) =>
  ariesServicesClient.post<ServiceAlertRecipientList>(`${BASE}/alert/${serviceId}/recipient`, { email });

export const saveServiceAlertRecipient = (serviceId: number, recipientId: number, email: string) =>
  ariesServicesClient.put<ServiceAlertRecipientList>(`${BASE}/alert/${serviceId}/recipient/${recipientId}`, {
    email,
  });

export const deleteServiceAlertRecipient = (serviceId: number, recipientId: number) =>
  ariesServicesClient.delete<ServiceAlertRecipientList>(`${BASE}/alert/${serviceId}/recipient/${recipientId}`);

// Customer reminders

export const getCustomerReminderGeneralConfig = () =>
  ariesServicesClient.get<CustomerReminderGeneralConfig>(`${BASE}/customer-reminder/general`);

export const saveCustomerReminderGeneralConfig = (model: CustomerReminderGeneralConfig) =>
  ariesServicesClient.put<CustomerReminderGeneralConfig>(`${BASE}/customer-reminder/general`, model);

export const getCustomerReminders = () =>
  ariesServicesClient.get<CustomerReminderConfigList>(`${BASE}/customer-reminder`);

export const saveCustomerReminder = (id: number, model: CustomerReminderConfigUpdate) =>
  ariesServicesClient.put<CustomerReminderConfig>(`${BASE}/customer-reminder/${id}`, model);

export const getCustomerReminderPlaceholders = (id: number) =>
  ariesServicesClient.get<CustomerReminderPlaceholderList>(`${BASE}/customer-reminder/${id}/placeholder`);

export const getCustomerReminderCampaigns = (id: number) =>
  ariesServicesClient.get<CustomerReminderCampaignList>(`${BASE}/customer-reminder/${id}/campaign`);
