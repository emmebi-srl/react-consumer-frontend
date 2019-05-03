import PropTypes from 'prop-types'

export const dataShape = PropTypes.shape({
    startVoltage: PropTypes.number.isRequired,
    nextVoltage: PropTypes.number.isRequired,
    restAbsorption: PropTypes.number.isRequired,
    alarmAbsorption: PropTypes.number.isRequired,
    hourAutonomy: PropTypes.number.isRequired,
    notes: PropTypes.string.isRequired, 
});

export const optionsShape = PropTypes.shape({
    readonly: PropTypes.bool,
});

