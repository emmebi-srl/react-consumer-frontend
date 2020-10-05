import React from 'react';
import PropTypes from 'prop-types';
import uniqueId from 'lodash/uniqueId';
import {
  Map as LeafletMap,
} from 'leaflet'

import styled from 'styled-components';

const MapContainer = styled.div`
  height: ${props => props.height}px;
`;
class MapComponent extends React.PureComponent {

  static propTypes = {
    zoomLevel: PropTypes.number,
    startLng: PropTypes.number,
    startLat: PropTypes.number,
    height: PropTypes.number,
  };

  static defaultProps = {
    zoomLevel: 13,
    startLng: 0,
    startLat: 0,
    height: 300,
  };

  constructor(props) {
    super(props);
    this.state = {
      mapId: uniqueId('mapId_'),
    };
    this.container = null;
    this.leafletElement = null;
  }

  bindContainer = (container) => {
    this.container = container
  }

  componentDidMount() {
    const { startLat, startLng, zoomLevel } = this.props;
    let center = { lat: startLat, lng: startLng };

    this.leafletElement = this.createLeafletElement({
      viewport: {
        center,
        zoom: zoomLevel,
      }
    });
  }

  createLeafletElement(props) {
    const { viewport, ...options } = props;
    if (viewport) {
      if (viewport.center) {
        options.center = viewport.center;
      }
      if (typeof viewport.zoom === 'number') {
        options.zoom = viewport.zoom;
      }
    }
    return new LeafletMap(this.container, options);
  }

  render () {
    const { mapId } = this.state;
    const { height } = this.props;
    return <MapContainer id={mapId}
      height={height}
      ref={this.bindContainer}>
      
    </MapContainer>
  };
}


export default MapComponent;