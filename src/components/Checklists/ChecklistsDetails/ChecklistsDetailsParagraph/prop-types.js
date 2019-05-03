import PropTypes from 'prop-types'

export const dataShape = PropTypes.shape({
  rows: PropTypes.array.isRequired,
});

export const optionsShape = PropTypes.shape({
    readonly: PropTypes.bool,
});