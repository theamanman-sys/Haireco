import { PrismaClient, ServiceCategory } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDOpQYmoc48dPQC2pQKjG4atN1VZDqc0Rg';
const prisma = new PrismaClient();

interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  rating?: number;
  user_ratings_total?: number;
  website?: string;
  opening_hours?: { weekday_text?: string[] };
  photos?: { photo_reference: string; height: number; width: number }[];
  geometry: { location: { lat: number; lng: number } };
  types?: string[];
  price_level?: number;
  editorial_summary?: { overview?: string };
}

const SEARCHES = [
  { type: 'beauty_salon', keyword: '' },
  { type: 'spa', keyword: '' },
  { type: 'hair_care', keyword: '' },
  { type: '', keyword: 'barber Addis Ababa' },
  { type: '', keyword: 'nail salon Addis Ababa' },
  { type: '', keyword: 'makeup studio Addis Ababa' },
  { type: '', keyword: 'beauty salon Addis Ababa' },
  { type: '', keyword: 'hairdresser Addis Ababa' },
  { type: '', keyword: 'massage spa Addis Ababa' },
];

function inferType(place: GooglePlaceResult): string {
  const types = place.types?.map(t => t.toLowerCase()) || [];
  const name = place.name.toLowerCase();
  if (types.includes('barber') || name.includes('barber')) return 'barber';
  if (types.includes('spa') || name.includes('spa') || name.includes('massage') || types.includes('massage')) return 'spa';
  if (types.includes('beauty_salon') || name.includes('salon') || name.includes('beauty')) return 'salon';
  if (types.includes('hair_care') || name.includes('hair') || name.includes('hairdresser')) return 'salon';
  if (name.includes('nail') || types.includes('nail_salon')) return 'nails';
  if (name.includes('makeup') || name.includes('cosmetic')) return 'makeup';
  return 'salon';
}

function formatPhone(phone: string): string {
  if (!phone) return '';
  let digits = phone.replace(/[\s\-\/\(\)\.\+]/g, '');
  if (digits.length > 10) digits = digits.slice(-9);
  if (!digits) return '';
  return `+251-${digits.slice(0, 3)}-${digits.slice(3)}`;
}

function getPhotoUrl(photoRef: string, maxWidth = 800): string {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoRef}&key=${API_KEY}`;
}

function defaultHours() {
  return {
    monday: { open: '09:00', close: '19:00', isClosed: false },
    tuesday: { open: '09:00', close: '19:00', isClosed: false },
    wednesday: { open: '09:00', close: '19:00', isClosed: false },
    thursday: { open: '09:00', close: '19:00', isClosed: false },
    friday: { open: '09:00', close: '20:00', isClosed: false },
    saturday: { open: '10:00', close: '18:00', isClosed: false },
    sunday: { open: '00:00', close: '00:00', isClosed: true },
  };
}

function getServicesForType(type: string): { name: string; duration: number; price: number; category: ServiceCategory }[] {
  switch (type) {
    case 'salon':
      return [
        { name: 'Women\'s Haircut & Blow-dry', duration: 60, price: 350, category: ServiceCategory.HAIRCUT },
        { name: 'Men\'s Haircut', duration: 30, price: 150, category: ServiceCategory.BARBER },
        { name: 'Hair Coloring (Full)', duration: 120, price: 1500, category: ServiceCategory.COLORING },
        { name: 'Blow-dry & Style', duration: 45, price: 400, category: ServiceCategory.STYLING },
        { name: 'Deep Conditioning Treatment', duration: 30, price: 250, category: ServiceCategory.TREATMENT },
        { name: 'Braiding (Full Head)', duration: 150, price: 600, category: ServiceCategory.BRAIDING },
      ];
    case 'spa':
      return [
        { name: 'Swedish Massage (60 min)', duration: 60, price: 800, category: ServiceCategory.TREATMENT },
        { name: 'Deep Tissue Massage (60 min)', duration: 60, price: 1000, category: ServiceCategory.TREATMENT },
        { name: 'Facial (Classic)', duration: 45, price: 500, category: ServiceCategory.TREATMENT },
        { name: 'Body Scrub & Wrap', duration: 75, price: 700, category: ServiceCategory.TREATMENT },
        { name: 'Steam Bath / Sauna', duration: 30, price: 300, category: ServiceCategory.TREATMENT },
      ];
    case 'barber':
      return [
        { name: 'Classic Haircut', duration: 30, price: 150, category: ServiceCategory.BARBER },
        { name: 'Fade Haircut', duration: 45, price: 200, category: ServiceCategory.BARBER },
        { name: 'Beard Trim & Shape', duration: 20, price: 100, category: ServiceCategory.BARBER },
        { name: 'Hot Towel Shave', duration: 30, price: 180, category: ServiceCategory.BARBER },
        { name: 'Haircut & Beard Combo', duration: 50, price: 250, category: ServiceCategory.BARBER },
      ];
    case 'nails':
      return [
        { name: 'Classic Manicure', duration: 30, price: 200, category: ServiceCategory.NAILS },
        { name: 'Classic Pedicure', duration: 40, price: 250, category: ServiceCategory.NAILS },
        { name: 'Gel Manicure', duration: 45, price: 350, category: ServiceCategory.NAILS },
        { name: 'Acrylic Full Set', duration: 90, price: 500, category: ServiceCategory.NAILS },
        { name: 'Manicure & Pedicure Combo', duration: 60, price: 400, category: ServiceCategory.NAILS },
      ];
    case 'makeup':
      return [
        { name: 'Natural Day Makeup', duration: 45, price: 300, category: ServiceCategory.MAKEUP },
        { name: 'Bridal Makeup (Trial)', duration: 90, price: 1000, category: ServiceCategory.MAKEUP },
        { name: 'Bridal Makeup (Wedding Day)', duration: 120, price: 2000, category: ServiceCategory.MAKEUP },
        { name: 'Evening / Glam Makeup', duration: 60, price: 500, category: ServiceCategory.MAKEUP },
        { name: 'Eyelash Extensions (Full Set)', duration: 90, price: 400, category: ServiceCategory.MAKEUP },
      ];
    default:
      return [{ name: 'Consultation', duration: 15, price: 0, category: ServiceCategory.OTHER }];
  }
}

async function nearbySearch(type: string, keyword: string, location: string): Promise<GooglePlaceResult[]> {
  let url: string;
  if (type) {
    url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=50000&type=${type}&key=${API_KEY}`;
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
  } else {
    url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(keyword)}&location=${location}&radius=50000&key=${API_KEY}`;
  }

  const results: GooglePlaceResult[] = [];
  let nextToken: string | null = null;

  do {
    let reqUrl = nextToken
      ? `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${nextToken}&key=${API_KEY}`
      : url;

    const res = await fetch(reqUrl, { headers: { 'User-Agent': 'HairEco/1.0' } });
    const data = await res.json() as { status: string; results: GooglePlaceResult[]; next_page_token?: string; error_message?: string };
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.log(`  ⚠️  Google API error (${type || keyword}): ${data.status} - ${data.error_message || ''}`);
      break;
    }
    if (data.results) {
      results.push(...data.results);
    }
    nextToken = data.next_page_token || null;
    if (nextToken) {
      await new Promise(r => setTimeout(r, 2000));
    }
  } while (nextToken);

  return results;
}

async function getPlaceDetails(placeId: string): Promise<GooglePlaceResult | null> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,place_id,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours,photos,geometry,types,price_level,editorial_summary&key=${API_KEY}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'HairEco/1.0' } });
    const data = await res.json() as { status: string; result: GooglePlaceResult };
    if (data.status === 'OK' && data.result) return data.result;
    return null;
  } catch {
    return null;
  }
}

async function main() {
  if (!API_KEY) {
    console.error('❌ Google Maps API key not found. Set VITE_GOOGLE_MAPS_API_KEY in server/.env');
    process.exit(1);
  }

  console.log('🌍 Fetching beauty places from Google Places API...');
  const location = '9.03,38.74';

  const seen = new Map<string, GooglePlaceResult>();

  for (const search of SEARCHES) {
    const label = search.type || search.keyword;
    console.log(`  🔍 Searching: ${label}...`);
    const results = await nearbySearch(search.type, search.keyword, location);
    console.log(`    Found ${results.length} results`);

    for (const r of results) {
      if (r.name && !seen.has(r.place_id) && !r.name.toLowerCase().includes('removed')) {
        seen.set(r.place_id, {
          place_id: r.place_id,
          name: r.name,
          formatted_address: r.formatted_address || r.vicinity || '',
          formatted_phone_number: '',
          rating: r.rating,
          user_ratings_total: r.user_ratings_total,
          geometry: r.geometry,
          types: r.types,
          photos: r.photos,
          price_level: r.price_level,
          opening_hours: r.opening_hours,
        });
      }
    }
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n  📊 Total unique places found: ${seen.size}`);

  const places = Array.from(seen.values());
  console.log('\n  Enriching with place details...');

  const enriched: GooglePlaceResult[] = [];
  for (let i = 0; i < places.length; i++) {
    const p = places[i];
    const details = await getPlaceDetails(p.place_id);
    const result = details || p;
    enriched.push(result);
    if ((i + 1) % 10 === 0) console.log(`    ${i + 1}/${places.length} enriched...`);
    await new Promise(r => setTimeout(r, 100));
  }

  const types: Record<string, number> = {};
  for (const p of enriched) {
    const t = inferType(p);
    types[t] = (types[t] || 0) + 1;
  }
  console.log('\n  📋 Type breakdown:');
  for (const [t, c] of Object.entries(types)) {
    console.log(`    ${t}: ${c}`);
  }

  console.log('\n  Cleaning database...');
  await prisma.review.deleteMany();
  await prisma.queueEntry.deleteMany();
  await prisma.bookingDeposit.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.staffMember.deleteMany();
  await prisma.service.deleteMany();
  await prisma.salon.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.salonOwnerProfile.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.professionalProfile.deleteMany();
  await prisma.shopProfile.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.advertisement.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.jobPost.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  console.log('  ✅ Cleaned existing data');

  console.log('\n  Creating subscription plans...');
  const plans = [
    { tier: 'FREE' as const, name: 'Free', price: 0, interval: 'monthly', features: ['1 Salon Listing', 'Up to 3 Staff', 'Basic Booking Management'], maxStaff: 3, maxSalons: 1, hasMarketplace: false, hasJobBoard: false, hasAnalytics: false },
    { tier: 'BASIC' as const, name: 'Basic', price: 299, interval: 'monthly', features: ['Up to 3 Salons', 'Up to 10 Staff', 'Booking & Queue System', 'Basic Analytics'], maxStaff: 10, maxSalons: 3, hasMarketplace: false, hasJobBoard: true, hasAnalytics: true },
    { tier: 'PREMIUM' as const, name: 'Premium', price: 799, interval: 'monthly', features: ['Up to 10 Salons', 'Unlimited Staff', 'All Features', 'Marketplace Access', 'Advanced Analytics', 'Priority Support'], maxStaff: 999, maxSalons: 10, hasMarketplace: true, hasJobBoard: true, hasAnalytics: true },
    { tier: 'ENTERPRISE' as const, name: 'Enterprise', price: 1999, interval: 'monthly', features: ['Unlimited Salons', 'Unlimited Staff', 'All Features', 'Custom Integrations', 'Dedicated Support', 'API Access'], maxStaff: 9999, maxSalons: 999, hasMarketplace: true, hasJobBoard: true, hasAnalytics: true },
  ];
  for (const plan of plans) {
    await prisma.subscriptionPlan.create({ data: plan });
  }

  const hash = await bcrypt.hash('password123', 10);
  const firstNames = ['Meron', 'Hanna', 'Yonas', 'Selam', 'Biniyam', 'Tigist', 'Dawit', 'Eden', 'Samuel', 'Betelhem', 'Abel', 'Mekdes'];
  const lastNames = ['Tesfaye', 'Gebre', 'Mekonnen', 'Wondimu', 'Assefa', 'Haile', 'Lemma', 'Shimeles', 'Belay', 'Abate', 'Mulugeta', 'Desta'];
  const reviewComments = ['Great service, very professional!', 'Loved the results, will come back.', 'Friendly staff and clean environment.', 'Best place in town for this service.', 'Affordable prices and quality work.', 'Very satisfied with my experience.'];

  let totalServices = 0;
  let totalStaff = 0;

  for (let i = 0; i < enriched.length; i++) {
    const p = enriched[i];
    const type = inferType(p);
    const name = p.name.trim();
    const address = p.formatted_address || `${p.name} area, Addis Ababa`;
    const lat = p.geometry?.location?.lat || 0;
    const lng = p.geometry?.location?.lng || 0;
    const phone = formatPhone(p.formatted_phone_number || '');
    const description = p.editorial_summary?.overview || `${type === 'salon' ? 'Beauty salon' : type === 'barber' ? 'Barbershop' : type === 'spa' ? 'Spa and wellness center' : type === 'nails' ? 'Nail studio' : 'Makeup studio'} located in Addis Ababa. Rated ${p.rating || 'N/A'} on Google.`;

    const photoRefs = p.photos?.slice(0, 5).map(ph => ph.photo_reference) || [];
    const coverUrl = photoRefs.length > 0 ? getPhotoUrl(photoRefs[0]) : '';
    const logoUrl = photoRefs.length > 0 ? getPhotoUrl(photoRefs[0], 200) : '';
    const images = photoRefs.map(ref => getPhotoUrl(ref));

    const ownerUser = await prisma.user.create({
      data: {
        email: `google_salon_${i}@haireco.com`,
        phone: phone || `+251-900-${String(i + 1).padStart(3, '0')}`,
        passwordHash: hash,
        role: 'SALON_OWNER',
        firstName: name.split(' ')[0] || 'Salon',
        lastName: 'Owner',
        isVerified: true,
        isActive: true,
      },
    });

    const ownerProfile = await prisma.salonOwnerProfile.create({
      data: {
        userId: ownerUser.id,
        subscriptionTier: i < 5 ? 'PREMIUM' : i < 15 ? 'BASIC' : 'FREE',
      } as any,
    });

    const workingHours = defaultHours();
    if (p.opening_hours?.weekday_text) {
      const dayMap: Record<string, string> = {
        monday: 'monday', tuesday: 'tuesday', wednesday: 'wednesday', thursday: 'thursday',
        friday: 'friday', saturday: 'saturday', sunday: 'sunday',
      };
      const engDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      for (const line of p.opening_hours.weekday_text) {
        for (const eng of engDays) {
          if (line.startsWith(eng)) {
            const key = dayMap[eng.toLowerCase()];
            if (!key) continue;
            const timePart = line.replace(eng, '').trim();
            if (timePart.toLowerCase() === 'closed') {
              workingHours[key] = { open: '00:00', close: '00:00', isClosed: true };
            } else {
              const match = timePart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?\s*[–-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
              if (match) {
                let openHour = parseInt(match[1]);
                let closeHour = parseInt(match[4]);
                const openMin = match[2];
                const closeMin = match[5];
                const openAmpm = match[3]?.toUpperCase();
                const closeAmpm = match[6]?.toUpperCase();
                if (openAmpm === 'PM' && openHour !== 12) openHour += 12;
                if (openAmpm === 'AM' && openHour === 12) openHour = 0;
                if (closeAmpm === 'PM' && closeHour !== 12) closeHour += 12;
                if (closeAmpm === 'AM' && closeHour === 12) closeHour = 0;
                workingHours[key] = {
                  open: `${String(openHour).padStart(2, '0')}:${openMin}`,
                  close: `${String(closeHour).padStart(2, '0')}:${closeMin}`,
                  isClosed: false,
                };
              }
            }
          }
        }
      }
    }

    const salon = await prisma.salon.create({
      data: {
        ownerId: ownerProfile.id,
        name,
        description,
        address: address.replace(/,\s*Ethiopia$/, '').replace(/,\s*Ethiopia\s*$/, '').trim() || address,
        city: 'Addis Ababa',
        country: 'Ethiopia',
        phone: phone || '',
        website: p.website || '',
        latitude: lat,
        longitude: lng,
        coverImage: coverUrl || undefined,
        logo: logoUrl || undefined,
        images: images || [],
        workingHours: workingHours as any,
        isActive: true,
        isFeatured: i < 6,
        averageRating: p.rating || 0,
        totalReviews: p.user_ratings_total || 0,
      },
    });

    const services = getServicesForType(type);
    for (const svc of services) {
      await prisma.service.create({
        data: {
          salonId: salon.id,
          name: svc.name,
          duration: svc.duration,
          price: svc.price,
          currency: 'ETB',
          category: svc.category,
          description: `${svc.name} at ${name}`,
        },
      });
      totalServices++;
    }

    const staffCount = 1 + Math.floor(Math.random() * 3);
    const positions: Record<string, string[]> = {
      salon: ['Senior Stylist', 'Junior Stylist', 'Color Specialist'],
      spa: ['Massage Therapist', 'Esthetician', 'Spa Attendant'],
      barber: ['Master Barber', 'Junior Barber', 'Barber Apprentice'],
      nails: ['Nail Technician', 'Nail Artist', 'Senior Nail Tech'],
      makeup: ['Senior Makeup Artist', 'Makeup Artist', 'Lash Specialist'],
    };
    const posList = positions[type] || ['Stylist', 'Assistant'];

    for (let s = 0; s < staffCount && (i * 3 + s) < firstNames.length * 2; s++) {
      const fi = (i * 3 + s) % firstNames.length;
      const li = (i * 3 + s) % lastNames.length;
      const staffUser = await prisma.user.create({
        data: {
          email: `gstaff_${i}_${s}@haireco.com`,
          phone: `+251-922-${String(100000 + i * 10 + s).slice(1)}`,
          passwordHash: hash,
          role: 'PROFESSIONAL',
          firstName: firstNames[fi],
          lastName: lastNames[li],
          isVerified: true,
          isActive: true,
        },
      });

      await prisma.professionalProfile.create({
        data: {
          userId: staffUser.id,
          bio: `Professional ${posList[s] || 'Stylist'} at ${name}`,
          yearsOfExperience: 1 + Math.floor(Math.random() * 15),
          specializations: services.filter(s => s.price > 0).slice(0, 3).map(s => s.name),
          verificationBadge: Math.random() > 0.5,
        },
      });

      await prisma.staffMember.create({
        data: {
          salonId: salon.id,
          userId: staffUser.id,
          position: posList[s] || 'Stylist',
          services: services.filter(s => s.price > 0).slice(0, 4).map(s => s.name),
          schedule: workingHours as any,
        },
      });
      totalStaff++;
    }

    const numReviews = Math.min(1 + Math.floor(Math.random() * 3), reviewComments.length);
    for (let r = 0; r < numReviews; r++) {
      const custUser = await prisma.user.upsert({
        where: { email: `gcustomer_${r}_${i}@haireco.com` },
        update: {},
        create: {
          email: `gcustomer_${r}_${i}@haireco.com`,
          passwordHash: hash,
          phone: `+251-933-${String(100000 + i * 10 + r).slice(1)}`,
          role: 'CUSTOMER',
          firstName: ['Abebe', 'Almaz', 'Chala', 'Desta', 'Etenesh', 'Fikru'][r % 6],
          lastName: ['Kebede', 'Wondimu', 'Tadesse', 'Belay', 'Lemma', 'Desta'][r % 6],
          isVerified: true,
          isActive: true,
        },
      });

      if (services.length > 0) {
        const svc = services[r % services.length];
        const startTime = new Date(2025, 5 + r, 10 + r, 10, 0, 0);
        const endTime = new Date(startTime.getTime() + svc.duration * 60000);
        const booking = await prisma.booking.create({
          data: {
            salonId: salon.id,
            customerId: custUser.id,
            serviceId: (await prisma.service.findFirst({ where: { salonId: salon.id, name: svc.name } }))!.id,
            status: 'COMPLETED',
            startTime,
            endTime,
            totalAmount: svc.price,
            depositPaid: true,
          },
        });

        await prisma.review.create({
          data: {
            bookingId: booking.id,
            customerId: custUser.id,
            salonId: salon.id,
            rating: 3 + Math.floor(Math.random() * 3),
            comment: reviewComments[r % reviewComments.length],
          },
        });
      }
    }
  }

  const allSalons = await prisma.salon.findMany({ include: { reviews: true } });
  for (const salon of allSalons) {
    if (salon.reviews.length > 0) {
      const avg = salon.reviews.reduce((sum, r) => sum + r.rating, 0) / salon.reviews.length;
      await prisma.salon.update({
        where: { id: salon.id },
        data: { averageRating: Math.round(avg * 10) / 10, totalReviews: salon.reviews.length },
      });
    }
  }

  console.log(`\n✅ Done! Seeded ${enriched.length} places from Google Places API:`);
  console.log(`  ${totalServices} services, ${totalStaff} staff`);
  console.log('\n🔐 Login: google_salon_0@haireco.com / password123');
}

main()
  .catch(e => { console.error('❌', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
