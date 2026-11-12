/** Same values as the backend `ServiceIntervalType` (Delphi `TServiceIntervalTypeEnum`). */
export const ServiceIntervalType = {
  DayOfMonth: 1,
  IntervalDays: 2,
  HourOfDay: 3,
  HoursBefore: 4,
  DaysBefore: 5,
  ManualOnly: 6,
  DaysAfter: 7,
} as const;

export type ServiceIntervalType = (typeof ServiceIntervalType)[keyof typeof ServiceIntervalType];

/** Same values as the backend `CustomerReminderDeliveryMode`. */
export const CustomerReminderDeliveryMode = {
  Direct: 0,
  Campaign: 1,
} as const;

export type CustomerReminderDeliveryMode =
  (typeof CustomerReminderDeliveryMode)[keyof typeof CustomerReminderDeliveryMode];

/** Customer reminder "Estratto conto cliente": in campaign mode it keeps its schedule (day of the month). */
export const CUSTOMER_INVOICES_STATEMENT_REMINDER_ID = 10;

/** SMTP of a group of services (last row of the general config table). */
export interface ServiceSmtpConfig {
  emailHost: string;
  emailPort: number;
  emailUsername: string;
  emailPassword: string;
  emailFrom: string;
  emailSsl: boolean;
}

export type ServiceAlertGeneralConfig = ServiceSmtpConfig;

export interface CustomerReminderGeneralConfig extends ServiceSmtpConfig {
  smsHost: string;
}

export interface ServiceAlertConfig {
  id: number;
  name: string;
  folder: string;
  intervalType: ServiceIntervalType;
  intervalValue: number;
  monthsNumber: number;
  /** Unix seconds. */
  lastExecutionDate: number;
  emailSubject: string;
  emailBody: string;
}

export interface ServiceAlertConfigList {
  services: ServiceAlertConfig[];
}

export interface ServiceAlertConfigUpdate {
  intervalType: ServiceIntervalType;
  intervalValue: number;
  monthsNumber: number;
  emailSubject: string;
  emailBody: string;
}

export interface ServiceAlertRecipient {
  id: number;
  serviceId: number;
  email: string;
}

export interface ServiceAlertRecipientList {
  recipients: ServiceAlertRecipient[];
}

export interface CustomerReminderConfig {
  id: number;
  name: string;
  intervalType: ServiceIntervalType;
  intervalValue: number;
  /** Unix seconds. */
  lastExecutionDate: number;
  emailEnabled: boolean;
  emailSubject: string;
  emailBody: string;
  smsEnabled: boolean;
  smsText: string;
  deliveryMode: CustomerReminderDeliveryMode;
  campaignId: number | null;
  /** The reminder has a campaign type, so it can be delivered by campaign. */
  supportsCampaignDelivery: boolean;
}

export interface CustomerReminderConfigList {
  reminders: CustomerReminderConfig[];
}

export type CustomerReminderConfigUpdate = Omit<
  CustomerReminderConfig,
  'id' | 'name' | 'lastExecutionDate' | 'supportsCampaignDelivery'
>;

export interface CustomerReminderPlaceholder {
  name: string;
  description: string;
}

export interface CustomerReminderPlaceholderList {
  placeholders: CustomerReminderPlaceholder[];
}

export interface CustomerReminderCampaign {
  id: number;
  name: string;
}

export interface CustomerReminderCampaignList {
  campaigns: CustomerReminderCampaign[];
}
