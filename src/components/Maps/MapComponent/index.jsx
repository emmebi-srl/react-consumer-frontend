import React from 'react';
import PropTypes from 'prop-types';
import uniqueId from 'lodash/uniqueId';
import {
  Map as LeafletMap,
  TileLayer
} from 'leaflet'

import styled from 'styled-components';
import { createMapHandler } from './MapHandler';

const MapContainer = styled.div`
  display: inline-block;
  height: ${props => props.height}px;
  width: 100%;
`;
class MapComponent extends React.PureComponent {

  static propTypes = {
    zoomLevel: PropTypes.number,
    startLng: PropTypes.number,
    startLat: PropTypes.number,
    height: PropTypes.number,
    bindMapHandler: PropTypes.func,
  };

  static defaultProps = {
    zoomLevel: 13,
    startLng: 0,
    startLat: 0,
    height: 300,
    bindMapHandler: () => {},
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

  getAccessToken = () => process.env.REACT_APP_LEAFLET_ACCESS_TOKEN;

  componentDidMount() {
    const { startLat, startLng, zoomLevel } = this.props;
    let center = { lat: startLat, lng: startLng };
    this.leafletElement = this.createLeafletElement({
      viewport: {
        center,
        zoom: zoomLevel,
      }
    });
    this.defaultLayer = this.createDefaultLayer();
    this.defaultLayer.addTo(this.leafletElement);
    
    this.props.bindMapHandler(createMapHandler(this.leafletElement));
  }
  
  createDefaultLayer() {
    const accessToken = this.getAccessToken();
    return new TileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: accessToken
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