import { LatLng, Marker, Icon } from 'leaflet';
import IconUrl from 'leaflet/dist/images/marker-icon.png';
import IconsShadowUrl from 'leaflet/dist/images/marker-shadow.png';

const centerMap = (map) => (lat, lng, zoom) => {
  map.setZoom(zoom)
  map.panTo(new LatLng(lat, lng));
};

const addMarker = (map, markers) => (lat, lng, popup) => {
  const marker = new Marker(new LatLng(lat, lng), {
    draggable: false,
    icon: new Icon({
      iconUrl: IconUrl,
      shadowUrl: IconsShadowUrl,
    })
  })
  if (popup) {
    marker.bindPopup(popup);
  }
  marker.addTo(map);
  markers.push(marker);
  return marker;
};

const addMarkers = (map, markers) => (inputMarkers) => {
  const subMarkers = [];
  inputMarkers.forEach((m) => {
    subMarkers.push(addMarker(map, markers)(m.lat, m.lng, m.popup));
  });
  return subMarkers;
};

const clearMarkers = (map, markers) => () => {
  while (markers.length > 0) {
    const marker = markers.pop();
    marker.removeFrom(map);
  }
};

const refreshMarkers = (map, markers) => (inputMarkers) => {
  clearMarkers(map, markers)();
  addMarkers(map, markers)(inputMarkers);
};

export const createMapHandler = (map) => {
  const markerList = [];

  return {
    centerMap: centerMap(map),
    addMarker: addMarker(map, markerList),
    addMarkers: addMarkers(map, markerList),
    clearMarkers: clearMarkers(map),
    refreshMarkers: refreshMarkers(map, markerList),

  }
};
