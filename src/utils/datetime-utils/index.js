import moment from 'moment'

export const getMomentByUnixtimestamp = ({unixTimestamp}) =>
  moment(unixTimestamp * 1000);

export const getStringDateByUnixtimestamp = ({format, unixTimestamp}) => {
  const mFormat = format || 'L'
  return getMomentByUnixtimestamp({unixTimestamp}).format(mFormat);
}
