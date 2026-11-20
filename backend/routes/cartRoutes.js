import express from 'express';
import {
  getCart, addItem, updateItem, removeItem, clearCart, mergeCart,
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // every cart route needs a logged-in user

router.get('/', getCart);
router.delete('/', clearCart);
router.post('/items', addItem);
router.post('/merge', mergeCart);
router.put('/items/:productId', updateItem);
router.delete('/items/:productId', removeItem);

export default router;
