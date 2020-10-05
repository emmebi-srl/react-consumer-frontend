import React from 'react';
import PropTypes from 'prop-types';
import { Header, Dimmer, Loader } from '../../../UI';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import SearchMapContainer from './SearchMapContainer';
import { media } from '../../../../styles';
import { Map } from '../../../Maps';

const START_LAT = 45.464664;
const START_LNG = 11.188540;
const START_ZOOM = 7;
const SEARCH_ZOOM = 12;

const Wrapper = styled.div`
  padding: 10px;

  ${media.tablet`
    padding: 10px 20px;
  `}
`;

class SearchMapView  extends React.PureComponent {
  mapHandler = null;

  bindMapHandler = (mapHandler) => {
    window.mapHandler = mapHandler;
    this.mapHandler = mapHandler;
  }

  refreshMapMarkers = (results) => {
    const firstElement = results[0];
    this.mapHandler.centerMap(
      firstElement.destination.latitude,
      firstElement.destination.longitude,
      SEARCH_ZOOM);
    
    this.mapHandler.refreshMarkers(results.map((result) => {
      return {
        lat: result.destination.latitude,
        lng: result.destination.longitude,
        popup: 'asd',
      };
    }));
  }

  componentDidMount = () => {
    const { results } = this.props;
    if (this.mapHandler && results && results.length > 0) {
      this.refreshMapMarkers(results);
    }
  }

  componentDidUpdate = (prevProps) => {
    const prevResults = prevProps.results;
    const currResults = this.props.results;
    
    if (prevResults.length > 0 && currResults.length === 0) {
      this.mapHandler.centerMap(START_LAT, START_LNG, START_ZOOM);
    } else if (currResults.length > 0) {
      const firstPrev = prevResults[0] || { destination: {} };
      const firstCurr = currResults[0] || { destination: {} };

      if (firstPrev.destination.latitude !== firstCurr.destination.latitude
        || firstPrev.destination.longitude !== firstCurr.destination.longitude) {
        this.refreshMapMarkers(currResults);
      }
    }
  };

  render() {
    const { loading } = this.props;
    return <Wrapper>
      <Header dimension='h3'>
        <FormattedMessage {...messages.resultsList} />
      </Header>
      <Dimmer inverted active={loading}>
        <Loader inverted />
      </Dimmer>
      <Map height={700}
        startLat={START_LAT}
        zoomLevel={START_ZOOM}
        startLng={START_LNG}
        bindMapHandler={this.bindMapHandler}></Map>
    </Wrapper>;
  };
};

// PropTypes
SearchMapView.propTypes = {
  toggleIsOpen: PropTypes.func.isRequired,
  results: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default SearchMapContainer(SearchMapView);