import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface GooglePlaceResult {
  place_id: string;
  name: string;
  photos?: { photo_reference: string; height: number; width: number }[];
  formatted_address?: string;
  rating?: number;
  price_level?: number;
  website?: string;
}

async function searchPlace(name: string, lat: number, lng: number): Promise<GooglePlaceResult | null> {
  const query = encodeURIComponent(name);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&location=${lat},${lng}&radius=100&key=${API_KEY}`;

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'HairEco/1.0' } });
    const data = await res.json() as { status: string; results: GooglePlaceResult[] };
    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0];
    }
    return null;
  } catch {
    return null;
  }
}

function getPhotoUrl(photoRef: string, maxWidth = 800): string {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoRef}&key=${API_KEY}`;
}

async function main() {
  console.log('📸 Fetching official photos from Google Places...');

  const salons = await prisma.salon.findMany({
    where: { isActive: true },
  });
  console.log(`  Found ${salons.length} salons to process`);

  let updated = 0;
  let withPhotos = 0;

  for (const salon of salons) {
    const lat = salon.latitude;
    const lng = salon.longitude;
    if (!lat || !lng) {
      console.log(`  ⏭️  ${salon.name}: no coordinates, skipping`);
      continue;
    }

    const place = await searchPlace(salon.name, lat, lng);

    if (place && place.photos && place.photos.length > 0) {
      const photoRefs = place.photos.map(p => p.photo_reference);
      const coverUrl = getPhotoUrl(photoRefs[0], 800);

      await prisma.salon.update({
        where: { id: salon.id },
        data: {
          coverImage: coverUrl,
          logo: getPhotoUrl(photoRefs[0], 200),
          images: photoRefs.slice(0, 5).map(ref => getPhotoUrl(ref, 800)),
          ...(place.website ? { website: place.website } : {}),
        },
      });
      withPhotos++;
      console.log(`  ✅ ${salon.name}: ${photoRefs.length} photo(s) found`);
    } else {
      console.log(`  ❌ ${salon.name}: no photos found on Google Places`);
    }

    updated++;
    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n📊 Done! ${withPhotos}/${updated} salons got photos`);
}

main()
  .catch(e => { console.error('❌', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
