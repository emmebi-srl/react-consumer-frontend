import PropTypes from 'prop-types'
import {getStringDateByUnixtimestamp} from '../../../utils/datetime-utils'

/**
 * Component to format date
 * 
 * @param {*} param0 
 * @param {number} param0.unixTimestamp - seconds
 */
export const AriesDate = ({format, unixTimestamp}) => {
  if (!unixTimestamp) return null;
  return getStringDateByUnixtimestamp({format, unixTimestamp})
}

AriesDate.propTypes = {
    format: PropTypes.string, 
    unixTimestamp: PropTypes.number,
};

export default AriesDate
