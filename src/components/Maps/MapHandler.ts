import { LatLng, Marker, Icon, Map } from 'leaflet';
import IconUrl from 'leaflet/dist/images/marker-icon.png';
import IconsShadowUrl from 'leaflet/dist/images/marker-shadow.png';

const centerMap = (map: Map) => (lat: number, lng: number, zoom: number) => {
  map.setZoom(zoom);
  map.panTo(new LatLng(lat, lng));
};

const addMarker = (map: Map, markers: Marker[]) => (lat: number, lng: number, popup?: string) => {
  const marker = new Marker(new LatLng(lat, lng), {
    draggable: false,
    icon: new Icon({
      iconUrl: IconUrl,
      shadowUrl: IconsShadowUrl,
    }),
  });
  if (popup) {
    marker.bindPopup(popup);
  }
  marker.addTo(map);
  markers.push(marker);
  return marker;
};

const addMarkers = (map: Map, markers: Marker[]) => (inputMarkers: { lat: number; lng: number; popup?: string }[]) => {
  const subMarkers: Marker[] = [];
  inputMarkers.forEach((m) => {
    subMarkers.push(addMarker(map, markers)(m.lat, m.lng, m.popup));
  });
  return subMarkers;
};

const clearMarkers = (map: Map, markers: Marker[]) => () => {
  while (markers.length > 0) {
    const marker = markers.pop();
    marker?.removeFrom(map);
  }
};

const refreshMarkers =
  (map: Map, markers: Marker[]) => (inputMarkers: { lat: number; lng: number; popup?: string }[]) => {
    clearMarkers(map, markers)();
    addMarkers(map, markers)(inputMarkers);
  };

export const createMapHandler = (map: Map) => {
  const markerList: Marker[] = [];

  return {
    centerMap: centerMap(map),
    addMarker: addMarker(map, markerList),
    addMarkers: addMarkers(map, markerList),
    clearMarkers: clearMarkers(map, markerList),
    refreshMarkers: refreshMarkers(map, markerList),
  };
};
