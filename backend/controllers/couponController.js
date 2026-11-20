import Coupon from '../models/Coupon.js';
import asyncHandler from '../utils/asyncHandler.js';
import { evaluateCoupon } from '../utils/pricing.js';

// POST /api/coupons/validate   { code, subtotal }   (public)
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  const { coupon, discount, freeShip } = await evaluateCoupon(code, Number(subtotal) || 0);
  res.json({ code: coupon.code, description: coupon.description, discount, freeShip });
});

// GET /api/coupons  (admin)
export const getCoupons = asyncHandler(async (req, res) => {
  res.json({ coupons: await Coupon.find().sort('-createdAt') });
});

// POST /api/coupons  (admin)
export const createCoupon = asyncHandler(async (req, res) => {
  const { code, description, type, value, maxDiscount, minOrder, expiresAt } = req.body;
  const coupon = await Coupon.create({
    code, description, type, value, maxDiscount, minOrder,
    expiresAt: expiresAt || undefined,
  });
  res.status(201).json({ message: 'Coupon created', coupon });
});

// PUT /api/coupons/:id/toggle  (admin) – enable / disable
export const toggleCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }
  coupon.active = !coupon.active;
  await coupon.save();
  res.json({ coupon });
});

// DELETE /api/coupons/:id  (admin)
export const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ message: 'Coupon deleted' });
});
