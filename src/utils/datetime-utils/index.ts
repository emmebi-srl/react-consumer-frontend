import moment from 'moment';

export const getMomentByUnixtimestamp = ({ unixTimestamp }: { unixTimestamp: number }) => moment(unixTimestamp * 1000);

export const getStringDateByUnixtimestamp = ({ format, unixTimestamp }: { format?: string; unixTimestamp: number }) => {
  const mFormat = format || 'L';
  return getMomentByUnixtimestamp({ unixTimestamp }).format(mFormat);
};
