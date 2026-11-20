import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';

const getOrCreateCart = async (userId) =>
  (await Cart.findOne({ user: userId })) || Cart.create({ user: userId, items: [] });

// Always respond with populated products so the UI can render immediately
const send = async (res, cart) => {
  await cart.populate('items.product');
  res.json({
    items: cart.items
      .filter((i) => i.product) // skip products that were deleted
      .map((i) => ({ product: i.product, qty: i.qty })),
  });
};

// Adds qty of a product, never exceeding available stock
const addToCart = (cart, product, qty) => {
  const existing = cart.items.find((i) => i.product.toString() === product._id.toString());
  const newQty = Math.min((existing ? existing.qty : 0) + qty, product.stock);
  if (existing) existing.qty = newQty;
  else cart.items.push({ product: product._id, qty: newQty });
};

// GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
  await send(res, await getOrCreateCart(req.user._id));
});

// POST /api/cart/items   { productId, qty }
export const addItem = asyncHandler(async (req, res) => {
  const { productId, qty = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (product.stock < 1) {
    res.status(400);
    throw new Error(`${product.name} is out of stock`);
  }
  const cart = await getOrCreateCart(req.user._id);
  addToCart(cart, product, Math.max(Number(qty) || 1, 1));
  await cart.save();
  await send(res, cart);
});

// PUT /api/cart/items/:productId   { qty }
export const updateItem = asyncHandler(async (req, res) => {
  const qty = Number(req.body.qty);
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((i) => i.product.toString() === req.params.productId);
  if (!item) {
    res.status(404);
    throw new Error('Item is not in your bag');
  }
  const product = await Product.findById(req.params.productId);
  if (!product || qty < 1) {
    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  } else {
    item.qty = Math.min(qty, product.stock);
  }
  await cart.save();
  await send(res, cart);
});

// DELETE /api/cart/items/:productId
export const removeItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  await cart.save();
  await send(res, cart);
});

// DELETE /api/cart
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  await send(res, cart);
});

// POST /api/cart/merge   { items: [{ productId, qty }] }
// Called right after login to merge the guest (localStorage) cart into the DB cart
export const mergeCart = asyncHandler(async (req, res) => {
  const incoming = Array.isArray(req.body.items) ? req.body.items : [];
  const cart = await getOrCreateCart(req.user._id);

  for (const { productId, qty } of incoming) {
    const product = await Product.findById(productId).catch(() => null);
    if (product && product.stock > 0) addToCart(cart, product, Math.max(Number(qty) || 1, 1));
  }
  await cart.save();
  await send(res, cart);
});
