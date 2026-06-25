import { PrismaClient, ServiceCategory } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface OsmNode {
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
}

async function fetchOverpass(query: string): Promise<OsmNode[]> {
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'HairEco/1.0' },
  });
  const data = await res.json() as { elements: OsmNode[] };
  return data.elements || [];
}

const REAL_PLACES = [
  { osmId: 1, name: 'Eyerusalem Beauty Spot', type: 'salon', lat: 8.99000, lng: 38.79280, addr: 'Bole Area', phone: '', social: '' },
  { osmId: 2, name: 'Abyssinia Beauty Salon', type: 'salon', lat: 8.99251, lng: 38.78294, addr: 'Bole Area', phone: '', social: '' },
  { osmId: 3, name: 'Hamelmal Beauty Salon', type: 'salon', lat: 9.01941, lng: 38.75431, addr: 'Bole, Wollo Sefer', phone: '', social: '' },
  { osmId: 4, name: 'Konjo Professional Salon', type: 'salon', lat: 8.99108, lng: 38.76702, addr: 'Bole, near Dembel', phone: '', social: '' },
  { osmId: 5, name: 'Mimi Beauty', type: 'makeup', lat: 8.95161, lng: 38.75992, addr: 'Bole Medhanealem', phone: '', social: '' },
  { osmId: 6, name: 'Smart Barber', type: 'barber', lat: 8.99506, lng: 38.73025, addr: 'Kirkos Sub-city', phone: '', social: '' },
  { osmId: 7, name: 'Sadula Beauty Salon and Spa', type: 'spa', lat: 8.99797, lng: 38.76724, addr: '626/35, Bole', phone: '+251-911-607664', social: '' },
  { osmId: 8, name: 'Maji Day Spa', type: 'spa', lat: 8.99354, lng: 38.76627, addr: 'Bole', phone: '', social: '' },
  { osmId: 9, name: 'Boston Day Spa', type: 'spa', lat: 8.99066, lng: 38.78389, addr: 'Bole', phone: '+251-11-6636557', social: '' },
  { osmId: 10, name: 'Soreti Spa', type: 'spa', lat: 8.99524, lng: 38.77568, addr: 'Bole Atlas', phone: '', social: '' },
  { osmId: 11, name: 'Signature Spa', type: 'spa', lat: 8.98777, lng: 38.77166, addr: 'W 03 H 1049, Kazanchis', phone: '+251-911-331134', social: '' },
  { osmId: 12, name: 'Diva Massage', type: 'spa', lat: 8.98730, lng: 38.73739, addr: 'Kirkos', phone: '', social: '' },
  { osmId: 13, name: 'Timo Xiire Salon', type: 'salon', lat: 8.98091, lng: 38.77691, addr: 'Bole', phone: '', social: '' },
  { osmId: 14, name: 'Oasis Salon & Spa', type: 'salon', lat: 9.00532, lng: 38.78066, addr: 'Bole, near Bole Airport', phone: '', social: '' },
  { osmId: 15, name: 'Beky Hair & Make Up Studio', type: 'makeup', lat: 9.03225, lng: 38.77224, addr: 'CMC', phone: '', social: '' },
  { osmId: 16, name: 'Selina Morocco Massage', type: 'spa', lat: 9.00978, lng: 38.78184, addr: 'Bole', phone: '', social: '' },
  { osmId: 17, name: 'Sally Beauty Supplies', type: 'makeup', lat: 9.03385, lng: 38.76308, addr: 'Bole, Dembel Area', phone: '', social: '' },
  { osmId: 18, name: 'Arsema Barber', type: 'barber', lat: 9.02037, lng: 38.77647, addr: 'Bole, Wollo Sefer', phone: '', social: '' },
  { osmId: 19, name: 'Muke Barbery', type: 'barber', lat: 9.02506, lng: 38.73393, addr: '22 Mazoria', phone: '', social: '' },
  { osmId: 20, name: 'Gentlemen\'s Barbershop', type: 'barber', lat: 9.00009, lng: 38.77971, addr: 'Bole', phone: '', social: '' },
  { osmId: 21, name: 'Be Wellness and Spa', type: 'spa', lat: 8.98321, lng: 38.79628, addr: 'CMC, Gurd Shola', phone: '', social: '' },
  { osmId: 22, name: 'Belay Women Salon', type: 'salon', lat: 8.99456, lng: 38.86121, addr: 'Kara, Bole', phone: '', social: '' },
  { osmId: 23, name: 'Lidu Beauty', type: 'makeup', lat: 8.98645, lng: 38.75864, addr: 'Bole', phone: '', social: '' },
];

const REAL_PLACES_AMHARIC = [
  { osmId: 101, name: 'Grace Beauty Salon / ግሬስ የውበት ሳሎን', type: 'salon', lat: 9.00725, lng: 38.79407, addr: 'Bole, Haile Garment Area', phone: '', social: '' },
  { osmId: 102, name: 'Ella Cosmetics / ኤላ ኮስሞቲክስ', type: 'makeup', lat: 9.04208, lng: 38.71364, addr: 'Atena Tera, Addis Ketema', phone: '+251-920-526979', social: '' },
  { osmId: 103, name: 'Yenas Beauty Salon / ዬናስ ፀጉር ቤት', type: 'salon', lat: 9.05328, lng: 38.75876, addr: 'Ayat Area', phone: '', social: '' },
  { osmId: 104, name: 'Fere Massage / ፍሬ ማሳጅ', type: 'spa', lat: 8.96095, lng: 38.76692, addr: 'Bole Michael', phone: '', social: '' },
];

const WORKING_HOURS = [
  'Mo-Su 08:00-20:00',
  'Mo-Su 09:00-21:00',
  'Mo-Su 09:00-20:30',
  'Mo-Su 07:00-22:00',
  'Mo-Su 09:00-18:00',
  '24/7',
];

const COVER_IMAGES: Record<string, string[]> = {
  salon: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1521590832167-161bc6c6f3f5?w=800&h=500&fit=crop',
  ],
  spa: [
    'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&h=500&fit=crop',
  ],
  barber: [
    'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1503951914875-452cb767134c?w=800&h=500&fit=crop',
  ],
  nails: [
    'https://images.unsplash.com/photo-1607779097040-26e2aa78f167?w=800&h=500&fit=crop',
  ],
  makeup: [
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800&h=500&fit=crop',
  ],
};

const LOGOS: Record<string, string> = {
  salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop',
  spa: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=200&h=200&fit=crop',
  barber: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=200&h=200&fit=crop',
  nails: 'https://images.unsplash.com/photo-1607779097040-26e2aa78f167?w=200&h=200&fit=crop',
  makeup: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&h=200&fit=crop',
};

const SERVICES: Record<string, { name: string; duration: number; price: number; category: ServiceCategory }[]> = {
  salon: [
    { name: "Women's Haircut & Blow-dry", duration: 60, price: 350, category: ServiceCategory.HAIRCUT },
    { name: "Men's Haircut", duration: 30, price: 150, category: ServiceCategory.BARBER },
    { name: 'Hair Coloring (Full)', duration: 120, price: 1500, category: ServiceCategory.COLORING },
    { name: 'Blow-dry & Style', duration: 45, price: 400, category: ServiceCategory.STYLING },
    { name: 'Deep Conditioning', duration: 30, price: 250, category: ServiceCategory.TREATMENT },
    { name: 'Braiding (Full Head)', duration: 150, price: 600, category: ServiceCategory.BRAIDING },
  ],
  spa: [
    { name: 'Swedish Massage (60 min)', duration: 60, price: 800, category: ServiceCategory.TREATMENT },
    { name: 'Deep Tissue Massage', duration: 60, price: 1000, category: ServiceCategory.TREATMENT },
    { name: 'Classic Facial', duration: 45, price: 500, category: ServiceCategory.TREATMENT },
    { name: 'Body Scrub & Wrap', duration: 75, price: 700, category: ServiceCategory.TREATMENT },
    { name: 'Steam Bath', duration: 30, price: 300, category: ServiceCategory.TREATMENT },
  ],
  barber: [
    { name: 'Classic Haircut', duration: 30, price: 150, category: ServiceCategory.BARBER },
    { name: 'Fade Haircut', duration: 45, price: 200, category: ServiceCategory.BARBER },
    { name: 'Beard Trim & Shape', duration: 20, price: 100, category: ServiceCategory.BARBER },
    { name: 'Hot Towel Shave', duration: 30, price: 180, category: ServiceCategory.BARBER },
    { name: 'Haircut & Beard Combo', duration: 50, price: 250, category: ServiceCategory.BARBER },
  ],
  nails: [
    { name: 'Classic Manicure', duration: 30, price: 200, category: ServiceCategory.NAILS },
    { name: 'Classic Pedicure', duration: 40, price: 250, category: ServiceCategory.NAILS },
    { name: 'Gel Manicure', duration: 45, price: 350, category: ServiceCategory.NAILS },
    { name: 'Acrylic Full Set', duration: 90, price: 500, category: ServiceCategory.NAILS },
    { name: 'Manicure & Pedicure', duration: 60, price: 400, category: ServiceCategory.NAILS },
  ],
  makeup: [
    { name: 'Natural Day Makeup', duration: 45, price: 300, category: ServiceCategory.MAKEUP },
    { name: 'Bridal Makeup (Trial)', duration: 90, price: 1000, category: ServiceCategory.MAKEUP },
    { name: 'Bridal Makeup (Wedding)', duration: 120, price: 2000, category: ServiceCategory.MAKEUP },
    { name: 'Evening Glam Makeup', duration: 60, price: 500, category: ServiceCategory.MAKEUP },
    { name: 'Eyelash Extensions', duration: 90, price: 400, category: ServiceCategory.MAKEUP },
  ],
};

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('🌍 Fetching real data from OpenStreetMap...');
  const q = `[out:json];(node["amenity"="beauty_salon"](8.85,38.55,9.15,38.98);node["shop"="hairdresser"](8.85,38.55,9.15,38.98);node["amenity"="spa"](8.85,38.55,9.15,38.98);node["shop"="barber"](8.85,38.55,9.15,38.98);node["shop"="beauty"](8.85,38.55,9.15,38.98);node["shop"="nail_salon"](8.85,38.55,9.15,38.98);node["shop"="massage"](8.85,38.55,9.15,38.98);node["amenity"="hair_care"](8.85,38.55,9.15,38.98););out body;`;
  const osmData = await fetchOverpass(q);
  console.log(`  OSM returned ${osmData.length} elements total`);

  // Clean database
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
  console.log('  Cleaned database');

  // Plans
  const plans = [
    { tier: 'FREE' as const, name: 'Free', price: 0, interval: 'monthly', features: ['1 Salon', '3 Staff', 'Basic Booking'], maxStaff: 3, maxSalons: 1, hasMarketplace: false, hasJobBoard: false, hasAnalytics: false },
    { tier: 'BASIC' as const, name: 'Basic', price: 299, interval: 'monthly', features: ['3 Salons', '10 Staff', 'Booking & Queue'], maxStaff: 10, maxSalons: 3, hasMarketplace: false, hasJobBoard: true, hasAnalytics: true },
    { tier: 'PREMIUM' as const, name: 'Premium', price: 799, interval: 'monthly', features: ['10 Salons', 'Unlimited Staff', 'All Features'], maxStaff: 999, maxSalons: 10, hasMarketplace: true, hasJobBoard: true, hasAnalytics: true },
    { tier: 'ENTERPRISE' as const, name: 'Enterprise', price: 1999, interval: 'monthly', features: ['Unlimited', 'Unlimited Staff', 'Custom'], maxStaff: 9999, maxSalons: 999, hasMarketplace: true, hasJobBoard: true, hasAnalytics: true },
  ];
  for (const p of plans) await prisma.subscriptionPlan.create({ data: p });
  console.log('  Created plans');

  const hash = await bcrypt.hash('password123', 10);
  const allPlaces = [...REAL_PLACES, ...REAL_PLACES_AMHARIC];

  // Enrich from OSM data where available
  const osmMap = new Map(osmData.filter(e => e.tags?.name).map(e => [e.tags.name.toLowerCase().trim(), e]));

  let totalStaff = 0;
  let totalServices = 0;

  for (let i = 0; i < allPlaces.length; i++) {
    const p = allPlaces[i];
    const osmLookup = osmMap.get(p.name.toLowerCase().trim()) || osmMap.get(p.name.split('/')[0]?.trim().toLowerCase() || '');
    const osmTags = osmLookup?.tags || {};
    const hasOsmPhone = osmTags.phone || osmTags['contact:phone'];
    const phone = p.phone || (hasOsmPhone ? hasOsmPhone.replace(/[\s,].*$/, '').replace(/^\+/, '') : '');

    const ownerUser = await prisma.user.create({
      data: {
        email: `salon${i + 1}@haireco.com`,
        phone: phone ? `+${phone.replace(/^\+/, '')}` : `+251-911-${String(100000 + i).slice(1)}`,
        passwordHash: hash,
        role: 'SALON_OWNER',
        firstName: p.name.split(/[\s/]/)[0],
        lastName: 'Owner',
        isVerified: true,
        isActive: true,
      },
    });

    const ownerProfile = await prisma.salonOwnerProfile.create({
      data: { userId: ownerUser.id, subscriptionTier: i < 5 ? 'PREMIUM' : i < 15 ? 'BASIC' : 'FREE' } as any,
    });

    const type = p.type;
    const hoursStr = osmTags.opening_hours || randomItem(WORKING_HOURS);
    const workingHours = {
      monday: { open: hoursStr.includes('08:') ? '08:00' : '09:00', close: hoursStr.includes('22:') ? '22:00' : hoursStr.includes('21:') ? '21:00' : '20:00', isClosed: false },
      tuesday: { open: hoursStr.includes('08:') ? '08:00' : '09:00', close: hoursStr.includes('22:') ? '22:00' : hoursStr.includes('21:') ? '21:00' : '20:00', isClosed: false },
      wednesday: { open: hoursStr.includes('08:') ? '08:00' : '09:00', close: hoursStr.includes('22:') ? '22:00' : hoursStr.includes('21:') ? '21:00' : '20:00', isClosed: false },
      thursday: { open: hoursStr.includes('08:') ? '08:00' : '09:00', close: hoursStr.includes('22:') ? '22:00' : hoursStr.includes('21:') ? '21:00' : '20:00', isClosed: false },
      friday: { open: hoursStr.includes('08:') ? '08:00' : '09:00', close: hoursStr.includes('22:') ? '22:00' : '20:00', isClosed: false },
      saturday: { open: '09:00', close: '18:00', isClosed: false },
      sunday: { open: '00:00', close: '00:00', isClosed: true },
    };

    const covers = COVER_IMAGES[type] || COVER_IMAGES.salon;
    const coverIdx = i % covers.length;
    const allImages = [covers[coverIdx], ...covers.filter((_, idx) => idx !== coverIdx)];

    const salon = await prisma.salon.create({
      data: {
        ownerId: ownerProfile.id,
        name: p.name,
        description: `${type === 'salon' ? 'Beauty salon' : type === 'barber' ? 'Barbershop' : type === 'spa' ? 'Spa and wellness center' : type === 'makeup' ? 'Beauty and cosmetics store' : 'Beauty business'} located in ${p.addr || 'Addis Ababa'}. ${osmLookup ? 'Listed on OpenStreetMap with real customer reviews.' : ''}`,
        address: p.addr || `${p.name} area, Addis Ababa`,
        city: 'Addis Ababa',
        country: 'Ethiopia',
        phone: phone ? `+${phone.replace(/^\+/, '')}` : '',
        latitude: p.lat,
        longitude: p.lng,
        website: osmTags.website || '',
        coverImage: covers[coverIdx],
        logo: LOGOS[type] || LOGOS.salon,
        images: allImages,
        workingHours: workingHours as any,
        isActive: true,
        isFeatured: i < 6,
      },
    });

    // Create services
    const svcList = SERVICES[type] || SERVICES.salon;
    for (const svc of svcList) {
      await prisma.service.create({
        data: {
          salonId: salon.id,
          name: svc.name,
          duration: svc.duration,
          price: svc.price,
          currency: 'ETB',
          category: svc.category,
          description: `${svc.name} at ${p.name}`,
        },
      });
      totalServices++;
    }

    // Create 1-2 staff
    const staffCount = 1 + Math.floor(Math.random() * 2);
    const positions: Record<string, string[]> = {
      salon: ['Senior Stylist', 'Junior Stylist'],
      spa: ['Massage Therapist', 'Esthetician'],
      barber: ['Master Barber', 'Junior Barber'],
      nails: ['Nail Technician', 'Nail Artist'],
      makeup: ['Makeup Artist', 'Beauty Consultant'],
    };
    const posList = positions[type] || ['Stylist'];

    const firstNames = ['Meron', 'Hanna', 'Yonas', 'Selam', 'Biniyam', 'Tigist', 'Dawit', 'Eden', 'Samuel', 'Betelhem', 'Abel', 'Mekdes'];
    const lastNames = ['Tesfaye', 'Gebre', 'Mekonnen', 'Wondimu', 'Assefa', 'Haile', 'Lemma', 'Shimeles', 'Belay', 'Abate', 'Mulugeta', 'Desta'];

    for (let s = 0; s < staffCount; s++) {
      const fi = (i * 3 + s) % firstNames.length;
      const li = (i * 3 + s) % lastNames.length;
      const staffUser = await prisma.user.create({
        data: {
          email: `staff${i}_${s}@haireco.com`,
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
          bio: `${posList[s] || 'Stylist'} at ${p.name}`,
          yearsOfExperience: 2 + Math.floor(Math.random() * 12),
          specializations: svcList.slice(0, 3).map(s => s.name),
          verificationBadge: Math.random() > 0.4,
        },
      });

      await prisma.staffMember.create({
        data: {
          salonId: salon.id,
          userId: staffUser.id,
          position: posList[s] || 'Stylist',
          services: svcList.slice(0, 4).map(s => s.name),
          schedule: workingHours as any,
        },
      });
      totalStaff++;
    }
  }

  console.log(`  ✅ Created ${allPlaces.length} real salons`);
  console.log(`  ✅ ${totalServices} services, ${totalStaff} staff`);
  console.log('\n📋 Real beauty places seeded:');
  allPlaces.forEach(p => console.log(`  ${p.type === 'salon' ? '💇' : p.type === 'spa' ? '🧖' : p.type === 'barber' ? '💈' : p.type === 'makeup' ? '💄' : '📍'} ${p.name}`));
  console.log('\n🔐 Login: salon1@haireco.com / password123');
}

main()
  .catch(e => { console.error('❌', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
