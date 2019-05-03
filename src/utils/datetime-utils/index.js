import moment from 'moment'

export const getDateByUnixtimestamp = ({format, unixTimestamp}) => {
  const mFormat = format || 'L'
  return (moment(unixTimestamp * 1000).format(mFormat))
}