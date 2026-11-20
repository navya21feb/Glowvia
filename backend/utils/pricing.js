import Coupon from '../models/Coupon.js';

export const FREE_SHIPPING_MIN = 999; // orders at or above this ship free
export const SHIPPING_FEE = 79;

export const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

// Validates a coupon against the cart subtotal and returns the discount.
// Throws a 400 error with a friendly message when the coupon can't be used.
export const evaluateCoupon = async (code, subtotal) => {
  if (!code) return { coupon: null, discount: 0, freeShip: false };

  const coupon = await Coupon.findOne({
    code: String(code).trim().toUpperCase(),
    active: true,
  });
  if (!coupon) throw httpError(400, 'Invalid or inactive coupon code');
  if (coupon.expiresAt && coupon.expiresAt < new Date())
    throw httpError(400, 'This coupon has expired');
  if (subtotal < coupon.minOrder)
    throw httpError(
      400,
      `Add items worth ₹${coupon.minOrder - subtotal} more to use ${coupon.code}`
    );

  let discount = 0;
  let freeShip = false;
  if (coupon.type === 'percent') {
    discount = Math.round((subtotal * coupon.value) / 100);
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else if (coupon.type === 'flat') {
    discount = Math.min(coupon.value, subtotal);
  } else {
    freeShip = true;
  }
  return { coupon, discount, freeShip };
};

export const calcShipping = (subtotal, freeShip) =>
  subtotal >= FREE_SHIPPING_MIN || freeShip ? 0 : SHIPPING_FEE;
