import PropTypes from 'prop-types'

export const dataShape = PropTypes.shape({
    quantity: PropTypes.number.isRequired,
    ampere: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
    year: PropTypes.number.isRequired,
    notes: PropTypes.string.isRequired, 
});

export const optionsShape = PropTypes.shape({
    readonly: PropTypes.bool,
});

