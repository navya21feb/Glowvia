import express from 'express';
import {
  validateCoupon, getCoupons, createCoupon, toggleCoupon, deleteCoupon,
} from '../controllers/couponController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/validate', validateCoupon); // public

router.get('/', protect, authorize('admin'), getCoupons);
router.post('/', protect, authorize('admin'), createCoupon);
router.put('/:id/toggle', protect, authorize('admin'), toggleCoupon);
router.delete('/:id', protect, authorize('admin'), deleteCoupon);

export default router;
