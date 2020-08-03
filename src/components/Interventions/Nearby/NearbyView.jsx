import React from 'react'
import styled from 'styled-components'
import SearchFormView from './SearchForm'
import SearchListView from './SearchList'
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
    </div>
  )
};

export default NearbyView;
