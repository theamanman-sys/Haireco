import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { NotFoundError, ForbiddenError, ConflictError } from '../utils/errors';

export const createJobPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const salon = await prisma.salon.findUnique({
      where: { id: req.body.salonId },
      include: { owner: true },
    });
    if (!salon) throw new NotFoundError('Salon');
    if (salon.owner.userId !== req.user!.userId) {
      throw new ForbiddenError('Not your salon');
    }

    const job = await prisma.jobPost.create({
      data: {
        ...req.body,
        ownerId: req.user!.userId,
      },
    });

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

export const getJobPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { jobType, status = 'OPEN', page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { status };
    if (jobType) where.jobType = jobType;

    const [jobs, total] = await Promise.all([
      prisma.jobPost.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        include: {
          salon: { select: { name: true, city: true, logo: true } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.jobPost.count({ where }),
    ]);

    res.json({
      success: true,
      data: jobs,
      meta: { total, page: parseInt(page as string), limit: parseInt(limit as string) },
    });
  } catch (error) {
    next(error);
  }
};

export const getJobPostById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const job = await prisma.jobPost.findUnique({
      where: { id: req.params.id },
      include: {
        salon: { select: { name: true, city: true, logo: true, description: true } },
        applications: {
          include: {
            applicant: { select: { firstName: true, lastName: true, avatar: true } },
          },
        },
      },
    });
    if (!job) throw new NotFoundError('Job post');
    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

export const applyForJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const job = await prisma.jobPost.findUnique({
      where: { id: req.params.jobId },
    });
    if (!job || job.status !== 'OPEN') {
      throw new NotFoundError('Job post');
    }

    const existing = await prisma.jobApplication.findUnique({
      where: { jobId_applicantId: { jobId: req.params.jobId, applicantId: req.user!.userId } },
    });
    if (existing) {
      throw new ConflictError('Already applied to this job');
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId: req.params.jobId,
        applicantId: req.user!.userId,
        coverLetter: req.body.coverLetter,
        resumeUrl: req.body.resumeUrl,
      },
      include: {
        job: { select: { title: true, salon: { select: { name: true } } } },
      },
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const application = await prisma.jobApplication.findUnique({
      where: { id: req.params.applicationId },
      include: { job: { include: { salon: { include: { owner: true } } } } },
    });
    if (!application) throw new NotFoundError('Application');

    if (application.job.salon.owner.userId !== req.user!.userId) {
      throw new ForbiddenError('Not your job post');
    }

    const updated = await prisma.jobApplication.update({
      where: { id: req.params.applicationId },
      data: { status: req.body.status },
    });

    if (req.body.status === 'HIRED') {
      await prisma.jobPost.update({
        where: { id: application.jobId },
        data: { status: 'FILLED' },
      });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
