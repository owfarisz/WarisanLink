import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { MapPin, Plane, Route, Cloud, Calendar, Thermometer, Droplets, Wind } from 'lucide-react';
import AccessLevelBadge from './AccessLevelBadge';
import MapView from './MapView';
import { weatherApi, routingApi } from '@/api/compass.api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const GATEWAY_COORDS = {
  'Batam': { lat: 1.0456, lon: 104.0305 },
  'Tanjung Pinang': { lat: 0.9185, lon: 104.4507 },
  'Medan': { lat: 3.5952, lon: 98.6722 },
  'Banda Aceh': { lat: 5.5537, lon: 95.3176 },
  'Jakarta': { lat: -6.2088, lon: 106.8456 },
  'Yogyakarta': { lat: -7.7956, lon: 110.3695 },
  'Makassar': { lat: -5.1477, lon: 119.4327 },
  'Padang': { lat: -0.9471, lon: 100.4172 },
  'Palembang': { lat: -2.9761, lon: 104.7754 },
  'Semarang': { lat: -6.9666, lon: 110.4196 },
  'Pontianak': { lat: -0.0263, lon: 109.3425 },
  'Kuala Lumpur': { lat: 3.1390, lon: 101.6869 },
  'Penang': { lat: 5.4141, lon: 100.3288 },
  'Kuching': { lat: 1.5535, lon: 110.3593 },
};

function CompassCard({ compass }) {
  const [weather, setWeather] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [gatewayCoords, setGatewayCoords] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!compass?.latitude || !compass?.longitude) {
      setLoading(false);
      return;
    }

    const fetchWeather = async () => {
      try {
        const res = await weatherApi.getCurrent(compass.latitude, compass.longitude);
        setWeather(res.data);
      } catch {}
    };

    const findGatewayCoords = () => {
      const gateway = compass.nearestGateway.toLowerCase();
      for (const [name, coords] of Object.entries(GATEWAY_COORDS)) {
        if (gateway.includes(name.toLowerCase())) {
          setGatewayCoords(coords);
          return coords;
        }
      }
      return null;
    };

    const coords = findGatewayCoords();
    if (coords) {
      fetchRoute(coords);
    }

    fetchWeather();
    setLoading(false);
  }, [compass]);

  const fetchRoute = async (gateway) => {
    try {
      const res = await routingApi.getDistance(gateway.lat, gateway.lon, compass.latitude, compass.longitude);
      if (res.data.distanceKm) {
        setRouteInfo(res.data);
      }
    } catch {}
  };

  if (!compass) return null;

  return (
    <Card>
      <CardHeader>
        <h3 className="text-xl font-bold flex items-center gap-2">
          Access Compass
        </h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem icon={Plane} label="Gateway Terdekat" value={compass.nearestGateway} />
          <InfoItem icon={Route} label="Entry Point" value={compass.entryPoint} />

          <div>
            <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
              <Route className="h-4 w-4" /> Jarak
            </span>
            <p className="mt-1 text-gray-900">
              {routeInfo ? `~${routeInfo.distanceKm} km (${routeInfo.durationMin} menit)` : compass.distanceKm ? `~${compass.distanceKm} km` : '-'}
            </p>
          </div>

          <InfoItem icon={Calendar} label="Best Time" value={compass.bestTimeToVisit} />
          <div>
            <span className="text-sm font-medium text-gray-500">Tingkat Akses</span>
            <div className="mt-1">
              <AccessLevelBadge level={compass.accessLevel} />
            </div>
          </div>
        </div>

        {weather && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold flex items-center gap-2 mb-3">
              <Cloud className="h-4 w-4" /> Cuaca Saat Ini
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Thermometer className="h-5 w-5 mx-auto text-orange-500" />
                <p className="text-lg font-bold">{weather.temperature}°C</p>
                <p className="text-xs text-gray-500">{weather.tempMin}° - {weather.tempMax}°</p>
              </div>
              <div>
                <Droplets className="h-5 w-5 mx-auto text-blue-500" />
                <p className="text-lg font-bold">{weather.humidity}%</p>
                <p className="text-xs text-gray-500">Kelembaban</p>
              </div>
              <div>
                <Wind className="h-5 w-5 mx-auto text-gray-500" />
                <p className="text-lg font-bold">{weather.windSpeed} km/h</p>
                <p className="text-xs text-gray-500">{weather.weatherDescription}</p>
              </div>
            </div>
          </div>
        )}

        {compass.latitude && compass.longitude && (
          <div className="mt-4">
            <MapView
              latitude={parseFloat(compass.latitude)}
              longitude={parseFloat(compass.longitude)}
              name={compass.nearestGateway}
              gatewayCoords={gatewayCoords}
            />
          </div>
        )}

        {compass.travelNotes && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold flex items-center gap-2 mb-2">
              Travel Notes
            </h4>
            <p className="text-gray-700">{compass.travelNotes}</p>
          </div>
        )}

        {compass.safetyNotes && (
          <div className="bg-amber-50 p-4 rounded-lg">
            <h4 className="font-semibold flex items-center gap-2 mb-2">
              Safety & Etiquette
            </h4>
            <p className="text-gray-700">{compass.safetyNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div>
      <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
        <Icon className="h-4 w-4" /> {label}
      </span>
      <p className="mt-1 text-gray-900">{value || '-'}</p>
    </div>
  );
}

export default CompassCard;
