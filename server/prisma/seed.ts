import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      tier: 'FREE' as const,
      name: 'Free',
      price: 0,
      interval: 'monthly',
      features: ['1 Salon Listing', 'Up to 3 Staff', 'Basic Booking Management'],
      maxStaff: 3,
      maxSalons: 1,
      hasMarketplace: false,
      hasJobBoard: false,
      hasAnalytics: false,
    },
    {
      tier: 'BASIC' as const,
      name: 'Basic',
      price: 299,
      interval: 'monthly',
      features: ['Up to 3 Salons', 'Up to 10 Staff', 'Booking & Queue System', 'Basic Analytics'],
      maxStaff: 10,
      maxSalons: 3,
      hasMarketplace: false,
      hasJobBoard: true,
      hasAnalytics: true,
    },
    {
      tier: 'PREMIUM' as const,
      name: 'Premium',
      price: 799,
      interval: 'monthly',
      features: ['Up to 10 Salons', 'Unlimited Staff', 'All Features', 'Marketplace Access', 'Advanced Analytics', 'Priority Support'],
      maxStaff: 999,
      maxSalons: 10,
      hasMarketplace: true,
      hasJobBoard: true,
      hasAnalytics: true,
    },
    {
      tier: 'ENTERPRISE' as const,
      name: 'Enterprise',
      price: 1999,
      interval: 'monthly',
      features: ['Unlimited Salons', 'Unlimited Staff', 'All Features', 'Custom Integrations', 'Dedicated Support', 'API Access'],
      maxStaff: 9999,
      maxSalons: 999,
      hasMarketplace: true,
      hasJobBoard: true,
      hasAnalytics: true,
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { tier: plan.tier },
      create: plan,
      update: plan,
    });
  }

  console.log('Seed completed: Subscription plans created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
