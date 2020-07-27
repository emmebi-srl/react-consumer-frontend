import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Dimmer, Loader } from '../../UI'
import SearchFormView from './SearchForm'
import SearchListView from './SearchList'
import { LightGrey } from '../../../styles'

const Separator = styled.div`
  height: 1px;
  background-color: ${LightGrey};
  margin: 30px;
`;

const NearbyView = ({isLoading}) => {
  return (
    <div>
      <Dimmer inverted active={isLoading}>
        <Loader inverted />
      </Dimmer>
      <SearchFormView></SearchFormView>
      <Separator></Separator>
      <SearchListView></SearchListView>
    </div>
  )
};

// PropTypes
NearbyView.propTypes = {
  isLoading: PropTypes.bool.isRequired,
};

export default NearbyView;
