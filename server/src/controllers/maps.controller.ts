import { Request, Response, NextFunction } from 'express';

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

const BEAUTY_PLACE_TYPES = [
  'beauty_salon',
  'hair_care',
  'spa',
  'barber',
  'nail_salon',
  'massage',
  'makeup_artist',
];

export const searchNearbyPlaces = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseInt(req.query.radius as string) || 5000;

    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({ success: false, message: 'lat and lng are required' });
      return;
    }

    if (!GOOGLE_API_KEY) {
      res.status(500).json({ success: false, message: 'Google Maps API key not configured on server' });
      return;
    }

    const allResults: any[] = [];
    const seenPlaceIds = new Set<string>();

    for (const type of BEAUTY_PLACE_TYPES) {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.results) {
          for (const place of data.results) {
            if (!seenPlaceIds.has(place.place_id)) {
              seenPlaceIds.add(place.place_id);
              allResults.push({
                id: place.place_id,
                name: place.name,
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng,
                address: place.vicinity || '',
                phone: place.formatted_phone_number || '',
                type: place.types?.[0] || '',
                rating: place.rating,
                website: place.website,
                photos: place.photos?.map((p: any) =>
                  `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photo_reference}&key=${GOOGLE_API_KEY}`
                ),
              });
            }
          }
        } else if (data.status === 'REQUEST_DENIED') {
          console.error('Google Places API request denied:', data.error_message);
          break;
        }
      } catch (err) {
        console.error(`Failed to search ${type}:`, err);
      }
    }

    res.json({ success: true, data: allResults });
  } catch (error) {
    next(error);
  }
};
