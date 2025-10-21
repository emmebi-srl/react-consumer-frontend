import React, { useEffect, useRef, useState } from 'react';
import _uniqueId from 'lodash/uniqueId';
import { Map as LeafletMap, TileLayer } from 'leaflet';

import { Box, SxProps } from '@mui/material';
import { createMapHandler } from './MapHandler';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  zoomLevel?: number;
  startLng?: number;
  startLat?: number;
  height?: number;
  bindMapHandler?: (handler: ReturnType<typeof createMapHandler>) => void;
  sx?: SxProps;
}

const getAccessToken = () => import.meta.env.VITE_LEAFLET_ACCESS_TOKEN as string;

const createDefaultLayer = () => {
  const accessToken = getAccessToken();
  return new TileLayer(`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${accessToken}`, {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
  });
};

const createLeafletElement = (container: HTMLDivElement, options: LeafletMap['options']) => {
  return new LeafletMap(container, options);
};

const Map: React.FC<MapProps> = ({ zoomLevel = 13, startLng = 0, startLat = 0, height = 300, bindMapHandler, sx }) => {
  const mapId = useRef(_uniqueId('mapId_'));

  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const defaultLayer = useRef<TileLayer | null>(null);
  const leafletElement = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (!container || leafletElement.current) return;

    leafletElement.current = createLeafletElement(container, {
      center: { lat: startLat, lng: startLng },
      zoom: zoomLevel,
    });
    defaultLayer.current = createDefaultLayer();
    defaultLayer.current.addTo(leafletElement.current);

    bindMapHandler?.(createMapHandler(leafletElement.current));
  }, [bindMapHandler, container, startLat, startLng, zoomLevel]);

  return (
    <Box
      sx={{
        height: `${height}px`,
        width: '100%',
        display: 'inline-block',
        ...sx,
      }}
      component={'div'}
      id={mapId.current}
      height={height}
      ref={(el: HTMLDivElement | null) => {
        setContainer(el);
      }}
    ></Box>
  );
};

export default Map;
