import React from 'react'
import styled from 'styled-components'
import SearchFormView from './SearchForm'
import SearchListView from './SearchList'
import SearchMapView from './SearchMap'
import SearchErrorMessage from './SearchErrorMessage';
import { LightGrey } from '../../../styles'

const Separator = styled.div`
  height: 1px;
  background-color: ${LightGrey};
  margin: 30px;
`;

const NearbyView = () => {
  return (
    <div>
      <SearchErrorMessage></SearchErrorMessage>
      <SearchFormView></SearchFormView>
      <Separator></Separator>
      <SearchListView></SearchListView>
      <Separator></Separator>
      <SearchMapView></SearchMapView>
    </div>
  )
};

export default NearbyView;
