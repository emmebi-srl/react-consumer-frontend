import { format, fromUnixTime } from 'date-fns';

const getTimestampDateParts = (unixTimestamp: number) => {
  const date = fromUnixTime(unixTimestamp);

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    second: date.getUTCSeconds(),
    millisecond: date.getUTCMilliseconds(),
  };
};

export const getDateByUnixtimestamp = ({ unixTimestamp }: { unixTimestamp: number }): Date => {
  const parts = getTimestampDateParts(unixTimestamp);

  // Backend timestamps represent an Italy local date/time encoded as Unix seconds.
  // We preserve those calendar fields and avoid re-applying the browser timezone offset.
  return new Date(parts.year, parts.month, parts.day, parts.hour, parts.minute, parts.second, parts.millisecond);
};

export const getStringDateByUnixtimestamp = (
  params: { format?: string; unixTimestamp: number } | number | null | undefined,
) => {
  if (!params) return '';

  if (typeof params === 'number') {
    params = { unixTimestamp: params };
  }

  const { unixTimestamp, format: fmt } = params;
  const dateFormat = fmt || 'dd/MM/yyyy';
  return format(getDateByUnixtimestamp({ unixTimestamp }), dateFormat);
};

export const getStringDateTimeByUnixtimestamp = (
  params: { format?: string; unixTimestamp: number } | number | null | undefined,
) => {
  if (!params) return '';

  if (typeof params === 'number') {
    params = { unixTimestamp: params };
  }

  const { unixTimestamp, format: fmt } = params;
  const dateFormat = fmt || 'MM/dd/yyyy HH:mm';
  return format(getDateByUnixtimestamp({ unixTimestamp }), dateFormat);
};
