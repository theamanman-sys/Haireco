import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { NotFoundError } from '../utils/errors';

export const getSubscriptionPlans = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' },
    });
    res.json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
};

export const subscribe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { planTier, paymentMethod } = req.body;

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { tier: planTier },
    });
    if (!plan) throw new NotFoundError('Subscription plan');

    const ownerProfile = await prisma.salonOwnerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!ownerProfile) {
      throw new NotFoundError('Salon owner profile');
    }

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + (plan.interval === 'yearly' ? 12 : 1));

    await prisma.$transaction([
      prisma.salonOwnerProfile.update({
        where: { userId: req.user!.userId },
        data: {
          subscriptionTier: plan.tier,
          subscriptionExpiry: expiryDate,
        },
      }),
      prisma.payment.create({
        data: {
          userId: req.user!.userId,
          amount: plan.price,
          method: paymentMethod,
          type: 'SUBSCRIPTION',
          status: 'COMPLETED',
          reference: `sub_${planTier}_${Date.now()}`,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        tier: plan.tier,
        expiryDate,
        message: `Subscribed to ${plan.name} plan`,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

export const createAdvertisement = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ad = await prisma.advertisement.create({
      data: {
        ...req.body,
        advertiserId: req.user!.userId,
      },
    });

    await prisma.payment.create({
      data: {
        userId: req.user!.userId,
        amount: req.body.budget,
        method: req.body.paymentMethod || 'TELEBIRR',
        type: 'ADVERTISING',
        status: 'COMPLETED',
        reference: `ad_${ad.id}`,
      },
    });

    res.status(201).json({ success: true, data: ad });
  } catch (error) {
    next(error);
  }
};

export const getActiveAds = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ads = await prisma.advertisement.findMany({
      where: {
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: ads });
  } catch (error) {
    next(error);
  }
};
