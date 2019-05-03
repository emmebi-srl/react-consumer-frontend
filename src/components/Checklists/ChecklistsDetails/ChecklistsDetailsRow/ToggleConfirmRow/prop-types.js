import PropTypes from 'prop-types'

export const dataShape = PropTypes.shape({
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    quantity: PropTypes.number, 
    tested: PropTypes.number,
    notes: PropTypes.string.isRequired, 
});

export const optionsShape = PropTypes.shape({
    hasNa: PropTypes.bool.isRequired,
    hasQuantity: PropTypes.bool.isRequired,
    readonly: PropTypes.bool,
});