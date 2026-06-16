type GoogleMapsLoadState = 'loading' | 'loaded' | 'error';

const state: { promise: Promise<typeof google.maps> | null; status: GoogleMapsLoadState } = {
  promise: null,
  status: 'loading',
};

export function loadGoogleMaps(): Promise<typeof google.maps> {
  if (state.promise) return state.promise;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  if (!apiKey) {
    state.status = 'error';
    state.promise = Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY is not set'));
    return state.promise;
  }

  state.promise = new Promise((resolve, reject) => {
    if (typeof google !== 'undefined' && google.maps) {
      state.status = 'loaded';
      resolve(google.maps);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    (window as any).initGoogleMaps = () => {
      state.status = 'loaded';
      resolve(google.maps);
    };

    script.onerror = () => {
      state.status = 'error';
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });

  return state.promise;
}

export function getMapsLoadState() {
  return state.status;
}
