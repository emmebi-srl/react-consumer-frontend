import PropTypes from 'prop-types'

export const LeftButton = PropTypes.shape({
    ref: PropTypes.string.isRequired,
    caption: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    isLoading: PropTypes.bool,
    icon: PropTypes.string,
    animated: PropTypes.bool,
    secondary: PropTypes.bool,
    primary: PropTypes.bool,
    ButtonWrapper: PropTypes.any,
});