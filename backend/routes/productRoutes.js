import express from 'express';
import {
  getProducts, getMeta, getMyProducts, getProduct,
  createProduct, updateProduct, deleteProduct, addReview,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public
router.get('/', getProducts);
router.get('/meta', getMeta);

// Vendor / Admin (must stay above '/:id')
router.get('/mine', protect, authorize('vendor', 'admin'), getMyProducts);
router.post('/', protect, authorize('vendor', 'admin'), createProduct);

router.get('/:id', getProduct);
router.put('/:id', protect, authorize('vendor', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteProduct);

// Any logged-in user
router.post('/:id/reviews', protect, addReview);

export default router;
