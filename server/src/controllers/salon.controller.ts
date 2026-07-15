import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export const getNearbySalons = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radiusKm = parseFloat(req.query.radius as string) || 10;
    const category = req.query.category as string | undefined;

    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({ success: false, message: 'lat and lng query parameters are required' });
      return;
    }

    const earthRadiusKm = 6371;
    const deltaLat = radiusKm / earthRadiusKm * (180 / Math.PI);
    const deltaLng = radiusKm / (earthRadiusKm * Math.cos(lat * Math.PI / 180)) * (180 / Math.PI);

    const minLat = lat - deltaLat;
    const maxLat = lat + deltaLat;
    const minLng = lng - deltaLng;
    const maxLng = lng + deltaLng;

    const where: any = {
      isActive: true,
      latitude: { not: null, gte: minLat, lte: maxLat },
      longitude: { not: null, gte: minLng, lte: maxLng },
    };

    if (category) {
      where.services = { some: { category: category.toUpperCase(), isActive: true } };
    }

    const salons = await prisma.salon.findMany({
      where,
      include: {
        services: { where: { isActive: true } },
        _count: { select: { reviews: true } },
      },
    });

    const toRad = (deg: number) => deg * Math.PI / 180;
    const withDistance = salons
      .map((s) => {
        const dLat = toRad(s.latitude! - lat);
        const dLng = toRad(s.longitude! - lng);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(s.latitude!)) * Math.sin(dLng / 2) ** 2;
        const distance = earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return { ...s, distance: Math.round(distance * 100) / 100 };
      })
      .filter((s) => s.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    res.json({ success: true, data: withDistance });
  } catch (error) {
    next(error);
  }
};

export const createSalon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerProfile = await prisma.salonOwnerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!ownerProfile) {
      throw new ForbiddenError('Only salon owners can create salons');
    }

    const existingSalons = await prisma.salon.count({
      where: { ownerId: ownerProfile.id },
    });

    const subscription = await prisma.subscriptionPlan.findUnique({
      where: { tier: ownerProfile.subscriptionTier },
    });

    if (subscription && existingSalons >= subscription.maxSalons) {
      throw new ForbiddenError('Salon limit reached for your subscription tier');
    }

    const salon = await prisma.salon.create({
      data: {
        ...req.body,
        ownerId: ownerProfile.id,
      },
    });

    res.status(201).json({ success: true, data: salon });
  } catch (error) {
    next(error);
  }
};

export const getSalons = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { city, isFeatured, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { isActive: true };
    if (city) where.city = { contains: city as string, mode: 'insensitive' };
    if (isFeatured === 'true') where.isFeatured = true;

    const [salons, total] = await Promise.all([
      prisma.salon.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        include: {
          services: { where: { isActive: true } },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.salon.count({ where }),
    ]);

    res.json({
      success: true,
      data: salons,
      meta: { total, page: parseInt(page as string), limit: parseInt(limit as string) },
    });
  } catch (error) {
    next(error);
  }
};

export const getSalonById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const salon = await prisma.salon.findUnique({
      where: { id: req.params.id },
      include: {
        services: { where: { isActive: true }, orderBy: { category: 'asc' } },
        staffMembers: {
          where: { isActive: true },
          include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { customer: { select: { firstName: true, lastName: true, avatar: true } } },
        },
        _count: { select: { reviews: true, bookings: true } },
      },
    });

    if (!salon) throw new NotFoundError('Salon');
    res.json({ success: true, data: salon });
  } catch (error) {
    next(error);
  }
};

export const updateSalon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const salon = await prisma.salon.findUnique({
      where: { id: req.params.id },
      include: { owner: true },
    });
    if (!salon) throw new NotFoundError('Salon');
    if (salon.owner.userId !== req.user!.userId) {
      throw new ForbiddenError('Not your salon');
    }

    const updated = await prisma.salon.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const createService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const salon = await prisma.salon.findUnique({
      where: { id: req.params.salonId },
      include: { owner: true },
    });
    if (!salon) throw new NotFoundError('Salon');
    if (salon.owner.userId !== req.user!.userId) {
      throw new ForbiddenError('Not your salon');
    }

    const service = await prisma.service.create({
      data: { ...req.body, salonId: req.params.salonId },
    });

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

export const getSalonServices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const services = await prisma.service.findMany({
      where: { salonId: req.params.salonId, isActive: true },
      orderBy: { category: 'asc' },
    });

    res.json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
};

export const manageStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const salon = await prisma.salon.findUnique({
      where: { id: req.params.salonId },
      include: { owner: true },
    });
    if (!salon) throw new NotFoundError('Salon');
    if (salon.owner.userId !== req.user!.userId) {
      throw new ForbiddenError('Not your salon');
    }

    const existing = await prisma.staffMember.count({
      where: { salonId: req.params.salonId },
    });

    const subscription = await prisma.subscriptionPlan.findUnique({
      where: { tier: salon.owner.subscriptionTier },
    });

    if (subscription && existing >= subscription.maxStaff) {
      throw new ForbiddenError('Staff limit reached');
    }

    const staff = await prisma.staffMember.create({
      data: { ...req.body, salonId: req.params.salonId },
    });

    res.status(201).json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
};
