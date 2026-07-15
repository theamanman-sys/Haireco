import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const IMAGES: Record<string, { cover: string[]; logo: string }> = {
  salon: {
    cover: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1561525140-8f3c7c7e7f8b?w=800&h=500&fit=crop',
    ],
    logo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop',
  },
  spa: {
    cover: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1596178060671-7a80dc8059ac?w=800&h=500&fit=crop',
    ],
    logo: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=200&h=200&fit=crop',
  },
  barber: {
    cover: [
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1503951914875-452cb767134c?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1521590832167-161bc6c6f3f5?w=800&h=500&fit=crop',
    ],
    logo: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=200&h=200&fit=crop',
  },
  nails: {
    cover: [
      'https://images.unsplash.com/photo-1607779097040-26e2aa78f167?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=500&fit=crop',
    ],
    logo: 'https://images.unsplash.com/photo-1607779097040-26e2aa78f167?w=200&h=200&fit=crop',
  },
  makeup: {
    cover: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1526047932273-34113c61227b?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800&h=500&fit=crop',
    ],
    logo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&h=200&fit=crop',
  },
};

const BEAUTY_SHOP_IMAGES = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=500&fit=crop',
];

function inferBusinessType(name: string, description: string, lat: number): string {
  const lower = (name + ' ' + description).toLowerCase();
  if (lower.includes('barber') || lower.includes('barbery') || lower.includes('gent')) return 'barber';
  if (lower.includes('nail') || lower.includes('polish')) return 'nails';
  if (lower.includes('makeup') || lower.includes('make up') || lower.includes('beauty') && (lower.includes('studio') || lower.includes('supply'))) return 'makeup';
  if (lower.includes('spa') || lower.includes('massage') || lower.includes('day spa')) return 'spa';
  if (lower.includes('salon') || lower.includes('hairdresser') || lower.includes('hair')) return 'salon';
  return 'salon';
}

async function main() {
  console.log('🖼️  Setting salon images from Unsplash...');

  const salons = await prisma.salon.findMany({ where: { isActive: true } });
  console.log(`  Found ${salons.length} salons`);

  let updated = 0;

  for (const salon of salons) {
    const type = inferBusinessType(salon.name, salon.description || '', salon.latitude || 0);
    const typeImages = IMAGES[type] || IMAGES.salon;

    const idx = updated % typeImages.cover.length;
    const cover = typeImages.cover[idx];
    
    const allImages = [cover, ...typeImages.cover.filter((_, i) => i !== idx)];

    await prisma.salon.update({
      where: { id: salon.id },
      data: {
        coverImage: cover,
        logo: typeImages.logo,
        images: allImages,
      },
    });

    console.log(`  ✅ ${salon.name} (${type}): cover + ${allImages.length - 1} images`);
    updated++;
  }

  console.log(`\n📊 Done! ${updated} salons updated with Unsplash images`);
}

main()
  .catch(e => { console.error('❌', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
