import PropTypes from 'prop-types'

export const dataShape = PropTypes.shape({
    date: PropTypes.number.isRequired,
    notes: PropTypes.string.isRequired, 
});

export const optionsShape = PropTypes.shape({
    readonly: PropTypes.bool,
});