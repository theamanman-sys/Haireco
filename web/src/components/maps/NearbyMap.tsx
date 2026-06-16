import { useEffect, useRef, useState } from 'react';
import { loadMap, darkTileUrl, tileAttribution, searchNearbyPlaces, type NearbyPlace } from '../../services/maps';
import { useTranslate } from '../../i18n/useTranslate';

export default function NearbyMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const t = useTranslate();

  useEffect(() => {
    if (!navigator.geolocation) {
      setError(t('salons.mapGeolocationError'));
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const L = await loadMap();
          await import('leaflet/dist/leaflet.css');

          if (!mapRef.current) return;

          mapInstance.current = L.map(mapRef.current, { center: [lat, lng], zoom: 14, zoomControl: true });

          L.tileLayer(darkTileUrl, {
            attribution: tileAttribution,
            maxZoom: 19,
          }).addTo(mapInstance.current);

          const userIcon = L.divIcon({
            className: '',
            html: `<div style="width:16px;height:16px;background:#800020;border:2px solid #c9a84c;border-radius:50%;box-shadow:0 0 8px rgba(0,0,0,0.5)"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });

          L.marker([lat, lng], { icon: userIcon }).addTo(mapInstance.current)
            .bindPopup(`<div style="color:#1a1510;font-size:13px"><strong>Your Location</strong></div>`);

          const results = await searchNearbyPlaces(lat, lng);
          setPlaces(results);

          results.forEach((place) => {
            const marker = L.marker([place.lat, place.lng]).addTo(mapInstance.current);
            const popup = `<div style="color:#1a1510;font-size:13px">
              <strong>${place.name}</strong><br>
              ${place.type ? place.type.replace('_', ' ') + '<br>' : ''}
              ${place.address ? place.address + '<br>' : ''}
              ${place.phone ? place.phone : ''}
            </div>`;
            marker.bindPopup(popup);
          });

          setLoading(false);
        } catch {
          setError(t('salons.mapLoadError'));
          setLoading(false);
        }
      },
      () => {
        setError(t('salons.mapLocationError'));
        setLoading(false);
      },
    );

    return () => {
      mapInstance.current?.remove();
    };
  }, []);

  return (
    <div className="space-y-3">
      <div ref={mapRef} className="w-full h-[400px] rounded-xl border border-white/[0.065] z-0" />
      {loading && <p className="text-sm text-cream/55">{t('salons.mapLoading')}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {places.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {places.map((p) => (
            <div key={p.id} className="text-xs bg-ebony border border-white/[0.065] rounded px-2 py-1 text-cream/70">
              {p.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
