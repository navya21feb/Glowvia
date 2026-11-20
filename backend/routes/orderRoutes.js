import express from 'express';
import {
  createOrder, getMyOrders, getAllOrders, getOrder,
  updateOrderStatus, cancelOrder, getStats,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createOrder);
router.get('/mine', getMyOrders);
router.get('/stats', authorize('vendor', 'admin'), getStats);
router.get('/', authorize('vendor', 'admin'), getAllOrders);

router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/status', authorize('admin'), updateOrderStatus);

export default router;
