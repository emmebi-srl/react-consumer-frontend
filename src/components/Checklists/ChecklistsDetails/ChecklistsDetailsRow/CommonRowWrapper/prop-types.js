import PropTypes from 'prop-types'

export const dataShape = PropTypes.shape({
    description: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired, 
    employeeIndications: PropTypes.string.isRequired
});