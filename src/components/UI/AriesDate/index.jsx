import PropTypes from 'prop-types'
import {getDateByUnixtimestamp} from '../../../utils/datetime-utils'

/**
 * Component to format date
 * 
 * @param {*} param0 
 * @param {number} param0.unixTimestamp - seconds
 */
const AriesDate = ({format, unixTimestamp}) => {
  return getDateByUnixtimestamp({format, unixTimestamp})
}

AriesDate.propTypes = {
    format: PropTypes.string, 
    unixTimestamp: PropTypes.number.isRequired
};

export default AriesDate
