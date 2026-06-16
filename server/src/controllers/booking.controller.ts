import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors';
const DEPOSIT_PERCENTAGE = 0.2;

export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { salonId, serviceId, professionalId, startTime, notes } = req.body;
    const customerId = req.user!.userId;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { salon: true },
    });
    if (!service || !service.isActive) throw new NotFoundError('Service');

    if (service.salonId !== salonId) {
      throw new ValidationError('Service does not belong to this salon');
    }

    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + service.duration * 60000);
    const depositAmount = service.price * DEPOSIT_PERCENTAGE;

    const conflicting = await prisma.booking.findFirst({
      where: {
        professionalId,
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
        OR: [
          { startTime: { lte: endDate }, endTime: { gte: startDate } },
        ],
      },
    });
    if (conflicting) {
      throw new ValidationError('Professional is not available at this time');
    }

    const booking = await prisma.booking.create({
      data: {
        salonId,
        customerId,
        professionalId,
        serviceId,
        startTime: startDate,
        endTime: endDate,
        depositAmount,
        totalAmount: service.price,
        notes,
        deposit: {
          create: {
            amount: depositAmount,
            method: req.body.paymentMethod || 'TELEBIRR',
          },
        },
      },
      include: {
        service: true,
        deposit: true,
      },
    });

    await prisma.customerProfile.update({
      where: { userId: customerId },
      data: { totalBookings: { increment: 1 } },
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const getUserBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { status, page = '1', limit = '20' } = req.query;

    const where: any = { customerId: userId };
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        orderBy: { startTime: 'desc' },
        include: {
          service: true,
          salon: { select: { id: true, name: true, address: true, logo: true } },
          professional: { select: { firstName: true, lastName: true } },
          deposit: true,
          review: true,
        },
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      success: true,
      data: bookings,
      meta: { total, page: parseInt(page as string), limit: parseInt(limit as string) },
    });
  } catch (error) {
    next(error);
  }
};

export const getSalonBookings = async (
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

    const { date, professionalId, status } = req.query;
    const where: any = { salonId: req.params.salonId };
    if (date) {
      const d = new Date(date as string);
      where.startTime = { gte: d, lt: new Date(d.getTime() + 86400000) };
    }
    if (professionalId) where.professionalId = professionalId;
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { startTime: 'asc' },
      include: {
        customer: { select: { firstName: true, lastName: true, phone: true } },
        service: true,
        professional: { select: { firstName: true, lastName: true } },
        deposit: true,
      },
    });

    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.body;
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { salon: { include: { owner: true } } },
    });
    if (!booking) throw new NotFoundError('Booking');

    const isOwner = booking.salon.owner.userId === req.user!.userId;
    const isProfessional = booking.professionalId === req.user!.userId;
    const isCustomer = booking.customerId === req.user!.userId;

    if (!isOwner && !isProfessional && !isCustomer) {
      throw new ForbiddenError('Not authorized to update this booking');
    }

    if (status === 'CANCELLED' && isCustomer && booking.depositPaid) {
      const hoursUntilBooking =
        (booking.startTime.getTime() - Date.now()) / 3600000;
      if (hoursUntilBooking < 24) {
        await prisma.bookingDeposit.update({
          where: { bookingId: booking.id },
          data: { status: 'FORFEITED' },
        });
      } else {
        await prisma.bookingDeposit.update({
          where: { bookingId: booking.id },
          data: { status: 'REFUNDED', refundedAt: new Date() },
        });
      }
    }

    if (status === 'COMPLETED') {
      const customerProfile = await prisma.customerProfile.findUnique({
        where: { userId: booking.customerId },
      });
      if (customerProfile) {
        await prisma.customerProfile.update({
          where: { userId: booking.customerId },
          data: {
            loyaltyPoints: { increment: 10 },
            totalSpent: { increment: booking.totalAmount },
          },
        });
      }
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status },
      include: { deposit: true },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const getQueue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { salonId } = req.params;
    const queue = await prisma.queueEntry.findMany({
      where: { salonId, status: 'WAITING' },
      orderBy: { position: 'asc' },
      include: {
        customer: { select: { firstName: true, lastName: true, avatar: true } },
        service: { select: { name: true, duration: true } },
        professional: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });

    res.json({ success: true, data: queue });
  } catch (error) {
    next(error);
  }
};

export const joinQueue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { salonId, serviceId, professionalId } = req.body;

    const lastEntry = await prisma.queueEntry.findFirst({
      where: { salonId, status: 'WAITING' },
      orderBy: { position: 'desc' },
    });

    const position = lastEntry ? lastEntry.position + 1 : 1;
    const estimatedWaitTime = position * 30;

    const entry = await prisma.queueEntry.create({
      data: {
        salonId,
        customerId: req.user!.userId,
        serviceId,
        professionalId,
        position,
        estimatedWaitTime,
      },
      include: {
        service: { select: { name: true, duration: true } },
      },
    });

    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};
