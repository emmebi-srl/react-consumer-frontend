import moment from 'moment';

export const getMomentByUnixtimestamp = ({ unixTimestamp }: { unixTimestamp: number }) => moment(unixTimestamp * 1000);

export const getStringDateByUnixtimestamp = (
  params: { format?: string; unixTimestamp: number } | number | null | undefined,
) => {
  if (!params) return '';

  if (typeof params === 'number') {
    params = { unixTimestamp: params };
  }

  const { unixTimestamp, format } = params;
  const mFormat = format || 'L';
  return getMomentByUnixtimestamp({ unixTimestamp }).format(mFormat);
};

export const getStringDateTimeByUnixtimestamp = (
  params: { format?: string; unixTimestamp: number } | number | null | undefined,
) => {
  if (!params) return '';

  if (typeof params === 'number') {
    params = { unixTimestamp: params };
  }

  const { unixTimestamp, format } = params;
  const mFormat = format || 'MM/DD/YYYY HH:mm';
  return getMomentByUnixtimestamp({ unixTimestamp }).format(mFormat);
};
