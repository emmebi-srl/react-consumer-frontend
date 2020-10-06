import React from 'react';
import { compose } from 'redux';
import { renderToString } from 'react-dom/server'
import PropTypes from 'prop-types';
import { Header, Dimmer, Loader, LocaleNumber } from '../../../UI';
import styled from 'styled-components';
import { FormattedMessage, injectIntl } from 'react-intl';
import messages from './messages';
import SearchMapContainer from './SearchMapContainer';
import { media, Red } from '../../../../styles';
import { Map, Popup } from '../../../Maps';
import { getMomentByUnixtimestamp } from '../../../../utils/datetime-utils';
import MonthName from '../../../UI/MonthName';

const START_LAT = 45.464664;
const START_LNG = 11.188540;
const START_ZOOM = 7;
const SEARCH_ZOOM = 13;

const Wrapper = styled.div`
  padding: 10px;

  ${media.tablet`
    padding: 10px 20px;
  `}
`;

const CompanyName = styled.div`
  font-size: 14px;
  display: inline-block;
  width: 100%;
  margin-bottom: 8px;
  font-weight: 600;
`;

const SystemInfo = styled.div`
  font-size: 12px;
  display: inline-block;
  width: 100%;

  ${media.tablet`
    font-size: 14px;
  `}
`;

const Distance = styled.div`
  font-size: 12px;
  .value {
    font-weight: 600;
  }

  ${media.tablet`
    font-size: 15px;
  `}
`;

const Maintenance = styled(Distance)`
  color: ${Red};
  ${media.tablet`
    margin-top: 5px;
  `}
`;

const Tickets = styled(Distance)`
  ${media.tablet`
    margin-top: 5px;
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
    const { intl: { formatMessage }} = this.props;
    this.mapHandler.centerMap(
      firstElement.destination.latitude,
      firstElement.destination.longitude,
      SEARCH_ZOOM);
    
    this.mapHandler.refreshMarkers(results.map((result) => {
      const { maintenance, tickets = [] } = result.items || {};
      const maintenanceDate = maintenance && maintenance.expirationDate
      ? getMomentByUnixtimestamp({ unixTimestamp: maintenance.expirationDate })
      : null;
      console.log(maintenanceDate);
      
      const popup = new Popup();
      popup.setContent(renderToString(<div>
        <CompanyName>{result.customerId} - {result.companyName}</CompanyName>
        <SystemInfo>{result.systemId} - {result.systemType} - {result.systemDescription}</SystemInfo>
        <SystemInfo>{result.destination.municipality} ({result.destination.province}) - {result.destination.postalCode} -  {result.destination.street} {result.destination.houseNumber}</SystemInfo>
        <Distance>
          {formatMessage(messages.distance)}:
          <span className="value"> <LocaleNumber value={result.distance} radix={2}/>km</span>
        </Distance>
        { maintenance ?<Maintenance>
          {formatMessage(messages.maintenance)} (<MonthName mDate={maintenanceDate}/> {maintenanceDate.year()})
        </Maintenance> : null }
        { tickets[0] ? <Tickets>
          {formatMessage(messages.ticket)}:
          <span className="value"> {tickets.length}</span>
        </Tickets>: null }
      </div>));

      return {
        lat: result.destination.latitude,
        lng: result.destination.longitude,
        popup: popup,
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

export default compose(SearchMapContainer, injectIntl)(SearchMapView);