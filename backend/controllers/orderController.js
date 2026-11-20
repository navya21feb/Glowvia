import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { evaluateCoupon, calcShipping } from '../utils/pricing.js';

const ADDRESS_FIELDS = ['fullName', 'phone', 'line1', 'city', 'state', 'pincode'];

const restock = (order) =>
  Product.bulkWrite(
    order.items.map((i) => ({
      updateOne: { filter: { _id: i.product }, update: { $inc: { stock: i.qty } } },
    }))
  );

const sameId = (a, b) => String(a) === String(b);

// POST /api/orders  – creates an order from the logged-in user's cart.
// Prices always come from the database, never from the browser.
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress = {}, paymentMethod = 'COD', couponCode } = req.body;

  for (const f of ADDRESS_FIELDS) {
    if (!String(shippingAddress[f] || '').trim()) {
      res.status(400);
      throw new Error('Please fill in your complete shipping address');
    }
  }
  if (!['COD', 'UPI', 'CARD'].includes(paymentMethod)) {
    res.status(400);
    throw new Error('Invalid payment method');
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  const lines = (cart?.items || []).filter((i) => i.product);
  if (!lines.length) {
    res.status(400);
    throw new Error('Your bag is empty');
  }

  for (const l of lines) {
    if (l.qty > l.product.stock) {
      res.status(400);
      throw new Error(
        l.product.stock === 0
          ? `${l.product.name} just went out of stock`
          : `Only ${l.product.stock} left of ${l.product.name}`
      );
    }
  }

  const itemsPrice = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const { coupon, discount, freeShip } = await evaluateCoupon(couponCode, itemsPrice);
  const shippingPrice = calcShipping(itemsPrice, freeShip);
  const totalPrice = Math.max(itemsPrice - discount + shippingPrice, 0);

  // Online payments are simulated in this lab project
  const paid = paymentMethod !== 'COD';

  const order = await Order.create({
    user: req.user._id,
    items: lines.map((l) => ({
      product: l.product._id,
      vendor: l.product.vendor,
      name: l.product.name,
      brand: l.product.brand,
      image: l.product.image,
      color: l.product.color,
      category: l.product.category,
      subCategory: l.product.subCategory,
      price: l.product.price,
      qty: l.qty,
    })),
    shippingAddress,
    paymentMethod,
    paymentStatus: paid ? 'Paid' : 'Pending',
    paymentId: paid ? `DEMO-${Date.now().toString(36).toUpperCase()}` : undefined,
    couponCode: coupon?.code,
    itemsPrice,
    discount,
    shippingPrice,
    totalPrice,
    statusHistory: [{ status: 'Placed' }],
  });

  await Product.bulkWrite(
    lines.map((l) => ({
      updateOne: { filter: { _id: l.product._id }, update: { $inc: { stock: -l.qty } } },
    }))
  );

  // Remember the address for next time and empty the cart
  req.user.address = shippingAddress;
  await req.user.save();
  cart.items = [];
  await cart.save();

  res.status(201).json({ message: 'Order placed successfully', order });
});

// GET /api/orders/mine
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json({ orders });
});

// GET /api/orders  (admin: everything, vendor: only orders containing their products)
export const getAllOrders = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const filter = isAdmin ? {} : { 'items.vendor': req.user._id };
  const orders = await Order.find(filter).populate('user', 'name email').sort('-createdAt');

  const result = orders.map((o) => {
    const obj = o.toObject();
    if (!isAdmin) obj.items = obj.items.filter((i) => sameId(i.vendor, req.user._id));
    return obj;
  });
  res.json({ orders: result });
});

// GET /api/orders/:id
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const isOwner = sameId(order.user._id, req.user._id);
  const isVendor = order.items.some((i) => sameId(i.vendor, req.user._id));
  if (!isOwner && !isVendor && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You are not allowed to view this order');
  }
  res.json({ order });
});

// PUT /api/orders/:id/status  (admin)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (['Delivered', 'Cancelled'].includes(order.status)) {
    res.status(400);
    throw new Error(`This order is already ${order.status.toLowerCase()}`);
  }

  if (status === 'Cancelled') {
    await restock(order);
    if (order.paymentStatus === 'Paid') order.paymentStatus = 'Refunded';
  }
  if (status === 'Delivered' && order.paymentMethod === 'COD') order.paymentStatus = 'Paid';

  order.status = status;
  order.statusHistory.push({ status });
  await order.save();
  res.json({ message: `Order marked as ${status}`, order });
});

// PUT /api/orders/:id/cancel  (customer, only before it ships)
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || !sameId(order.user, req.user._id)) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (!['Placed', 'Packed'].includes(order.status)) {
    res.status(400);
    throw new Error('This order can no longer be cancelled');
  }

  await restock(order);
  if (order.paymentStatus === 'Paid') order.paymentStatus = 'Refunded';
  order.status = 'Cancelled';
  order.statusHistory.push({ status: 'Cancelled' });
  await order.save();
  res.json({ message: 'Order cancelled', order });
});

// GET /api/orders/stats  (admin / vendor dashboard numbers)
export const getStats = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const orders = await Order.find(isAdmin ? {} : { 'items.vendor': req.user._id })
    .populate('user', 'name')
    .sort('-createdAt')
    .lean();

  const valid = orders.filter((o) => o.status !== 'Cancelled');
  const amountOf = (o) =>
    isAdmin
      ? o.totalPrice
      : o.items.filter((i) => sameId(i.vendor, req.user._id)).reduce((s, i) => s + i.price * i.qty, 0);

  const revenue = valid.reduce((s, o) => s + amountOf(o), 0);

  const sales = [...Array(7)].map((_, k) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - k));
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const total = valid
      .filter((o) => o.createdAt >= day && o.createdAt < next)
      .reduce((s, o) => s + amountOf(o), 0);
    return { label: day.toLocaleDateString('en-IN', { weekday: 'short' }), total };
  });

  const byStatus = {};
  orders.forEach((o) => (byStatus[o.status] = (byStatus[o.status] || 0) + 1));

  const productFilter = isAdmin ? {} : { vendor: req.user._id };
  const [productCount, lowStock, customers] = await Promise.all([
    Product.countDocuments(productFilter),
    Product.find({ ...productFilter, stock: { $lte: 5 } }).select('name stock').sort('stock').limit(6).lean(),
    isAdmin ? User.countDocuments({ role: 'customer' }) : Promise.resolve(0),
  ]);

  res.json({
    revenue,
    orderCount: orders.length,
    productCount,
    customers,
    lowStock,
    sales,
    byStatus,
    recent: orders.slice(0, 5).map((o) => ({
      _id: o._id,
      customer: o.user?.name || 'Customer',
      total: amountOf(o),
      status: o.status,
      createdAt: o.createdAt,
    })),
  });
});
