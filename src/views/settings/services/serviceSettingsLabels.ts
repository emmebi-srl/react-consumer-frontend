import { ServiceIntervalType } from '~/types/aries-proxy/service-settings';

/** Same texts as the Delphi STR_INTERVAL_TYPE_* constants. */
// Partial: the values come from the database, an unknown type must fall back to a generic label.
export const INTERVAL_TYPE_LABELS: Partial<Record<number, string>> = {
  [ServiceIntervalType.DayOfMonth]: 'Giorno del mese',
  [ServiceIntervalType.IntervalDays]: 'Intervallo di giorni',
  [ServiceIntervalType.HourOfDay]: 'Ora del giorno',
  [ServiceIntervalType.HoursBefore]: 'Ore prima',
  [ServiceIntervalType.DaysBefore]: 'Giorni prima',
  [ServiceIntervalType.ManualOnly]: 'Solo manuale',
  [ServiceIntervalType.DaysAfter]: 'Giorni dopo',
};

/** Label of the "valore" field, which means something different for every interval type. */
export const INTERVAL_VALUE_LABELS: Partial<Record<number, string>> = {
  [ServiceIntervalType.DayOfMonth]: 'Giorno del mese (1-31)',
  [ServiceIntervalType.IntervalDays]: 'Ogni quanti giorni',
  [ServiceIntervalType.HourOfDay]: 'Ora del giorno (0-23)',
  [ServiceIntervalType.HoursBefore]: 'Ore prima',
  [ServiceIntervalType.DaysBefore]: 'Giorni prima',
  [ServiceIntervalType.ManualOnly]: 'Valore',
  [ServiceIntervalType.DaysAfter]: 'Giorni dopo',
};

/** Interval types offered by the Delphi form (and accepted by the server) for each group of services. */
export const ALERT_INTERVAL_TYPES: ServiceIntervalType[] = [
  ServiceIntervalType.DayOfMonth,
  ServiceIntervalType.IntervalDays,
];

export const CUSTOMER_REMINDER_INTERVAL_TYPES: ServiceIntervalType[] = [
  ServiceIntervalType.DayOfMonth,
  ServiceIntervalType.HourOfDay,
  ServiceIntervalType.HoursBefore,
  ServiceIntervalType.DaysBefore,
  ServiceIntervalType.DaysAfter,
  ServiceIntervalType.ManualOnly,
];

export const getIntervalTypeLabel = (type: number) => INTERVAL_TYPE_LABELS[type] ?? `Tipo ${type}`;
