import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../../services/maps';
import { useTranslate } from '../../i18n/useTranslate';

interface NearbyPlace {
  id: string;
  name: string;
  rating?: number;
  vicinity?: string;
  lat: number;
  lng: number;
}

export default function NearbyMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const t = useTranslate();

  useEffect(() => {
    if (!navigator.geolocation) {
      setError(t('salons.mapGeolocationError'));
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(loc);

        try {
          const maps = await loadGoogleMaps();
          if (!mapRef.current) return;

          const map = new maps.Map(mapRef.current, {
            center: loc,
            zoom: 14,
            styles: [
              { elementType: 'geometry', stylers: [{ color: '#1a1510' }] },
              { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1510' }] },
              { elementType: 'labels.text.fill', stylers: [{ color: '#f0ebe3' }] },
              { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2a2018' }] },
              { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#0f0d0b' }] },
              { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
              { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f0d0b' }] },
              { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#2a2018' }] },
            ],
          });

          new maps.Marker({
            position: loc,
            map,
            title: 'Your Location',
            icon: {
              path: maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#800020',
              fillOpacity: 1,
              strokeColor: '#c9a84c',
              strokeWeight: 2,
            },
          });

          const service = new maps.places.PlacesService(map);

          service.nearbySearch(
            { location: loc, radius: 3000, type: 'beauty_salon' },
            (results: any, status: string) => {
              if (status === 'OK' && results) {
                const found: NearbyPlace[] = [];

                results.forEach((place: google.maps.places.PlaceResult) => {
                  if (!place.geometry?.location) return;
                  const p: NearbyPlace = {
                    id: place.place_id || '',
                    name: place.name || '',
                    rating: place.rating,
                    vicinity: place.vicinity,
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                  };
                  found.push(p);

                  const marker = new maps.Marker({
                    map,
                    position: place.geometry!.location,
                    title: place.name,
                    icon: { url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' },
                  });

                  const info = new maps.InfoWindow({
                    content: `<div style="color:#1a1510;font-size:13px"><strong>${place.name}</strong><br>${place.rating ? 'Rating: ' + place.rating + ' ⭐<br>' : ''}${place.vicinity || ''}</div>`,
                  });

                  marker.addListener('click', () => { info.open(map, marker); });
                });

                setPlaces(found);
              }
              setLoading(false);
            },
          );
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
  }, []);

  return (
    <div className="space-y-3">
      <div ref={mapRef} className="w-full h-[400px] rounded-xl border border-white/[0.065]" />
      {loading && <p className="text-sm text-cream/55">{t('salons.mapLoading')}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {places.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {places.map((p) => (
            <div key={p.id} className="text-xs bg-ebony border border-white/[0.065] rounded px-2 py-1 text-cream/70">
              {p.name} {p.rating ? `(${p.rating}⭐)` : ''}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
