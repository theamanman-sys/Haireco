import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { config } from '../config';
import { ConflictError, UnauthorizedError } from '../utils/errors';

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    phone: z.string().min(9).max(15),
    password: z.string().min(6).max(100),
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    role: z.enum(['CUSTOMER', 'PROFESSIONAL', 'SALON_OWNER', 'SHOP']),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    password: z.string(),
  }),
});

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, phone, password, firstName, lastName, role } = registerSchema.parse(req).body;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existing) {
      throw new ConflictError('Email or phone already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        firstName,
        lastName,
        role,
        ...(role === 'CUSTOMER' && {
          customerProfile: { create: {} },
        }),
        ...(role === 'PROFESSIONAL' && {
          professionalProfile: { create: {} },
        }),
        ...(role === 'SALON_OWNER' && {
          salonOwnerProfile: { create: {} },
        }),
        ...(role === 'SHOP' && {
          shopProfile: { create: { shopName: `${firstName}'s Shop` } },
        }),
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.status(201).json({
      success: true,
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, phone, password } = loginSchema.parse(req).body;

    const user = await prisma.user.findFirst({
      where: email ? { email } : { phone: phone! },
    });
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        isVerified: true,
        professionalProfile: true,
        customerProfile: true,
        salonOwnerProfile: true,
        shopProfile: true,
      },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
