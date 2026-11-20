import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, default: '' },
    type: { type: String, enum: ['percent', 'flat', 'freeship'], required: true },
    value: { type: Number, default: 0, min: 0 }, // % or ₹ depending on type
    maxDiscount: { type: Number, default: 0 }, // cap for percent coupons (0 = no cap)
    minOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    expiresAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Coupon', couponSchema);
