import PropTypes from 'prop-types'

export const dataShape = PropTypes.shape({
    brand: PropTypes.string.isRequired,
    model: PropTypes.string.isRequired,
    position: PropTypes.string.isRequired,
    ampere: PropTypes.number.isRequired,
    notes: PropTypes.string.isRequired, 
});

export const optionsShape = PropTypes.shape({
    readonly: PropTypes.bool,
});