import React from 'react';
import PropTypes from 'prop-types'
import { Message } from '../../../UI';
import SearchErrorMessageContainer from './SearchErrorMessageContainer';
import { FormattedMessage } from 'react-intl';
import messages from './messages';


const SearchErrorMessageView = ({ hasError, error }) => {
  if (!hasError) return null;
  let titleMessage = messages.genericTitle;
  let textMessage = messages.genericText;

  const data = error && error.data;
  if (data) {
    if (data.message === 'KO_ADDRESS-NOT_FOUND') {
      titleMessage = messages.invalidAddressTitle;
      textMessage = messages.invalidAddressText;
    }
  }
  return (
    <Message negative>
      <Message.Header><FormattedMessage {...titleMessage}/></Message.Header>
      <p><FormattedMessage {...textMessage}/></p>
    </Message>
  )
};

// PropTypes
SearchErrorMessageView.propTypes = {
  hasError: PropTypes.bool.isRequired,
  error: PropTypes.any.isRequired,
};


export default SearchErrorMessageContainer(SearchErrorMessageView);