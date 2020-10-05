import React from 'react'
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components'
import SearchFormView from './SearchForm'
import SearchListView from './SearchList'
import SearchMapView from './SearchMap'
import SearchErrorMessage from './SearchErrorMessage';
import { LightGrey } from '../../../styles'
import { Button, Icon } from '../../UI'
import NearbyViewContainer from './NearbyViewContainer';

const Separator = styled.div`
  height: 1px;
  background-color: ${LightGrey};
  margin: 30px;
`;

const ViewContainer = styled.div`
  display: none;
  width: 100%;
  position: relative;
  ${props => props.active && css`
    display: inline-block;
  `}
`;

const ButtonGroupCnt = styled.div`
  float: right;
  margin-right: 20px;
`;

const NearbyView = ({ viewType, openedMap, setMapViewType, setListViewType }) => {
  return (
    <div>
      <SearchErrorMessage></SearchErrorMessage>
      <SearchFormView></SearchFormView>
      <Separator></Separator>
      <ButtonGroupCnt>
        <Button.Group>
          <Button onClick={setListViewType}
            icon
            active={viewType === 'list'}>
            <Icon name='list' />
          </Button>
          <Button onClick={setMapViewType}
            icon
            active={viewType === 'map'}>
            <Icon name='map outline' />
          </Button>
        </Button.Group>
      </ButtonGroupCnt>
      <ViewContainer active={viewType === 'list'}>
        <SearchListView></SearchListView>
      </ViewContainer>
      <ViewContainer active={viewType === 'map'}>
        { openedMap ? <SearchMapView></SearchMapView> : null }
      </ViewContainer>
    </div>
  )
};

NearbyView.propTypes = {
  viewType: PropTypes.string.isRequired,
  openedMap: PropTypes.bool.isRequired,
  setMapViewType: PropTypes.func.isRequired,
  setListViewType: PropTypes.func.isRequired,
};


export default NearbyViewContainer(NearbyView);
