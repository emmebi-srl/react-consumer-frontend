import PropTypes from 'prop-types'
import monthUtils from '../../../utils/months-utils'


/**
 * Component to get the month name
 * 
 * @param {*} param0 
 * @param {number} param0.unixTimestamp - milliseconds
 */
const MonthName = ({index}) => {
  return monthUtils.getMonthName(index)
}
 
MonthName.propTypes = {
  index: PropTypes.number.isRequired, 
};

export default MonthName
