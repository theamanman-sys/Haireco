import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.body.bookingId },
      include: { review: true },
    });

    if (!booking) throw new NotFoundError('Booking');
    if (booking.customerId !== req.user!.userId) {
      throw new ForbiddenError('Not your booking');
    }
    if (booking.status !== 'COMPLETED') {
      throw new ForbiddenError('Can only review completed bookings');
    }
    if (booking.review) {
      throw new ForbiddenError('Already reviewed');
    }

    const review = await prisma.review.create({
      data: {
        bookingId: booking.id,
        customerId: req.user!.userId,
        salonId: booking.salonId,
        professionalId: booking.professionalId,
        rating: req.body.rating,
        comment: req.body.comment,
        images: req.body.images || [],
      },
    });

    const agg = await prisma.review.aggregate({
      where: { salonId: booking.salonId },
      _avg: { rating: true },
      _count: true,
    });

    await prisma.salon.update({
      where: { id: booking.salonId },
      data: {
        averageRating: agg._avg.rating || 0,
        totalReviews: agg._count,
      },
    });

    if (booking.professionalId) {
      const profAgg = await prisma.review.aggregate({
        where: { professionalId: booking.professionalId },
        _avg: { rating: true },
        _count: true,
      });

      await prisma.professionalProfile.update({
        where: { userId: booking.professionalId },
        data: {
          averageRating: profAgg._avg.rating || 0,
          totalReviews: profAgg._count,
        },
      });
    }

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const getSalonReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { salonId: req.params.salonId },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { firstName: true, lastName: true, avatar: true } },
        },
      }),
      prisma.review.count({ where: { salonId: req.params.salonId } }),
    ]);

    res.json({
      success: true,
      data: reviews,
      meta: { total, page: parseInt(page as string), limit: parseInt(limit as string) },
    });
  } catch (error) {
    next(error);
  }
};
