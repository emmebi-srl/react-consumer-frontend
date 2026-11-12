import z from 'zod';
import { ServiceIntervalType } from '~/types/aries-proxy/service-settings';

export const intervalFields = {
  intervalType: z.number({ message: 'Intervallo obbligatorio' }).int(),
  // An empty input becomes NaN (see IntervalFields), which z.number() rejects with this message.
  intervalValue: z.number({ message: 'Valore obbligatorio' }).int('Valore non valido').min(0, 'Valore non valido'),
};

/** Ranges that make sense for each interval type (manual only ignores the value). */
export const refineInterval = (values: { intervalType: number; intervalValue: number }, ctx: z.RefinementCtx) => {
  const { intervalType, intervalValue: value } = values;
  if (intervalType === ServiceIntervalType.ManualOnly) return;

  if (intervalType === ServiceIntervalType.DayOfMonth && (value < 1 || value > 31)) {
    ctx.addIssue({ code: 'custom', path: ['intervalValue'], message: 'Giorno tra 1 e 31' });
  }
  if (intervalType === ServiceIntervalType.HourOfDay && value > 23) {
    ctx.addIssue({ code: 'custom', path: ['intervalValue'], message: 'Ora tra 0 e 23' });
  }
  if (intervalType === ServiceIntervalType.IntervalDays && value < 1) {
    ctx.addIssue({ code: 'custom', path: ['intervalValue'], message: 'Almeno 1 giorno' });
  }
};
