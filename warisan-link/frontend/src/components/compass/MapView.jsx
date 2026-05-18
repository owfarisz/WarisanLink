import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapView({ latitude, longitude, name, gatewayCoords }) {
  const markers = [[latitude, longitude]];
  if (gatewayCoords) {
    markers.unshift([gatewayCoords.lat, gatewayCoords.lon]);
  }

  return (
    <MapContainer center={[latitude, longitude]} zoom={10} className="h-64 w-full rounded-lg z-0">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {markers.map((pos, i) => (
        <Marker key={i} position={pos}>
          <Popup>{i === 0 && gatewayCoords ? 'Gateway' : name}</Popup>
        </Marker>
      ))}
      {gatewayCoords && <Polyline positions={markers} color="#e2b96f" weight={3} dashArray="5, 10" />}
    </MapContainer>
  );
}

export default MapView;
