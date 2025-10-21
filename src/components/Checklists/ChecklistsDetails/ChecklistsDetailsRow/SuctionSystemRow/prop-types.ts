import PropTypes from 'prop-types'

export const dataShape = PropTypes.shape({
    suctionSystemType: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    sensorNumber: PropTypes.string,
    brand: PropTypes.string,
    model: PropTypes.string,
    position: PropTypes.string,
    notes: PropTypes.string, 
});

export const optionsShape = PropTypes.shape({
    readonly: PropTypes.bool,
});