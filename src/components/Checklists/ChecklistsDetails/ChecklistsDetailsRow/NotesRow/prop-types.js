import PropTypes from 'prop-types'

export const dataShape = PropTypes.shape({
    notes: PropTypes.string.isRequired, 
});

export const optionsShape = PropTypes.shape({
    readonly: PropTypes.bool,
});