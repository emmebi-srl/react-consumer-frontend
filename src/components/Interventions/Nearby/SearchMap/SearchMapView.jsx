import React from 'react';
import PropTypes from 'prop-types';
import { Header, Dimmer, Loader } from '../../../UI';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import SearchMapContainer from './SearchMapContainer';
import { media } from '../../../../styles';
import { Map } from '../../../Maps';

const Wrapper = styled.div`
  padding: 10px;

  ${media.tablet`
    padding: 10px 20px;
  `}
`;

class SearchMapView  extends React.PureComponent {
  state = {
    lat: 51.505,
    lng: -0.09,
    zoom: 13,
  }

  render() {
    const { loading } = this.props;
    const position = [this.state.lat, this.state.lng]
    return <Wrapper>
      <Header dimension='h3'>
        <FormattedMessage {...messages.resultsList} />
      </Header>
      <Dimmer inverted active={loading}>
        <Loader inverted />
      </Dimmer>
      <Map></Map>
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