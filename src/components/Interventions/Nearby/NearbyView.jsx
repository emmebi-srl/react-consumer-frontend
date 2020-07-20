import React from 'react'
import PropTypes from 'prop-types'
import { Dimmer, Loader } from '../../UI'
import SearchFormView from './SearchForm'
import SearchListView from './SearchList'

const NearbyView = ({isLoading}) => {
  return (
    <div>
      <Dimmer inverted active={isLoading}>
        <Loader inverted />
      </Dimmer>
      <SearchFormView></SearchFormView>
      <SearchListView></SearchListView>
    </div>
  )
};

// PropTypes
NearbyView.propTypes = {
  isLoading: PropTypes.bool.isRequired,
};

export default NearbyView;
