import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { NotFoundError, ForbiddenError } from '../utils/errors';
const MARKETPLACE_COMMISSION_RATE = 0.08;

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const shop = await prisma.shopProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!shop) throw new ForbiddenError('Only shops can list products');

    const product = await prisma.product.create({
      data: { ...req.body, shopId: shop.id },
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, saleType, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { isActive: true, stock: { gt: 0 } };
    if (category) where.category = category;
    if (saleType) where.saleType = saleType;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        include: {
          shop: { select: { shopName: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      data: products,
      meta: { total, page: parseInt(page as string), limit: parseInt(limit as string) },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        shop: { select: { shopName: true, commissionRate: true } },
      },
    });
    if (!product) throw new NotFoundError('Product');
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { shopId, items, shippingAddress, paymentMethod } = req.body;

    const shop = await prisma.shopProfile.findUnique({
      where: { id: shopId },
    });
    if (!shop) throw new NotFoundError('Shop');

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product || !product.isActive) {
        throw new NotFoundError(`Product ${item.productId}`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const totalPrice = product.price * item.quantity;
      totalAmount += totalPrice;
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice,
      });
    }

    const commissionAmount = totalAmount * shop.commissionRate;

    const order = await prisma.order.create({
      data: {
        buyerId: req.user!.userId,
        shopId,
        totalAmount,
        commissionAmount,
        shippingAddress,
        paymentMethod,
        items: { create: orderItems },
      },
      include: { items: { include: { product: true } } },
    });

    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await prisma.payment.create({
      data: {
        userId: req.user!.userId,
        amount: totalAmount,
        method: paymentMethod,
        type: 'MARKETPLACE',
        status: 'COMPLETED',
        reference: order.id,
      },
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { buyerId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: { select: { name: true, images: true } } } },
        shop: { select: { shopName: true } },
      },
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};
