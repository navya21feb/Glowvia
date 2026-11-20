import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORTS = {
  newest: '-createdAt',
  'price-asc': 'price',
  'price-desc': '-price',
  rating: '-rating',
  popular: '-numReviews',
};

// GET /api/products  – search, filter, sort, paginate (public)
export const getProducts = asyncHandler(async (req, res) => {
  const {
    search, category, subCategory, brand, minPrice, maxPrice,
    featured, sort = 'newest', page = 1, limit = 12,
  } = req.query;

  const filter = {};
  if (search) {
    const rx = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ name: rx }, { brand: rx }, { category: rx }, { subCategory: rx }, { description: rx }];
  }
  if (category) filter.category = category;
  if (subCategory) filter.subCategory = subCategory;
  if (brand) filter.brand = { $in: brand.split(',') };
  if (featured === 'true') filter.featured = true;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const pageNum = Math.max(Number(page) || 1, 1);
  const perPage = Math.min(Math.max(Number(limit) || 12, 1), 60);

  const [total, products] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter)
      .select('-reviews')
      .sort(SORTS[sort] || SORTS.newest)
      .skip((pageNum - 1) * perPage)
      .limit(perPage),
  ]);

  res.json({ products, total, page: pageNum, pages: Math.ceil(total / perPage) });
});

// GET /api/products/meta  – data for the filter sidebar
export const getMeta = asyncHandler(async (req, res) => {
  const [categories, brands, top] = await Promise.all([
    Product.aggregate([
      { $group: { _id: '$category', subCategories: { $addToSet: '$subCategory' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Product.distinct('brand'),
    Product.findOne().sort('-price').select('price'),
  ]);
  res.json({
    categories: categories.map((c) => ({
      name: c._id,
      count: c.count,
      subCategories: c.subCategories.sort(),
    })),
    brands: brands.sort(),
    maxPrice: top?.price || 0,
  });
});

// GET /api/products/mine  – products the logged-in vendor/admin manages
export const getMyProducts = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { vendor: req.user._id };
  const products = await Product.find(filter)
    .select('-reviews')
    .populate('vendor', 'name')
    .sort('-createdAt');
  res.json({ products });
});

// GET /api/products/:id
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('vendor', 'name');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ product });
});

const FIELDS = ['name', 'brand', 'description', 'category', 'subCategory', 'price', 'mrp', 'stock', 'image', 'color', 'featured'];
const pick = (body) => Object.fromEntries(FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));

// POST /api/products  (vendor, admin)
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({ ...pick(req.body), vendor: req.user._id });
  res.status(201).json({ message: 'Product added successfully', product });
});

const loadOwned = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  const isOwner = product.vendor.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You can only manage your own products');
  }
  return product;
};

// PUT /api/products/:id  (owner vendor or admin)
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await loadOwned(req, res);
  Object.assign(product, pick(req.body));
  await product.save();
  res.json({ message: 'Product updated', product });
});

// DELETE /api/products/:id  (owner vendor or admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await loadOwned(req, res);
  await product.deleteOne();
  res.json({ message: 'Product deleted' });
});

// POST /api/products/:id/reviews  (any logged-in user, once per product)
export const addReview = asyncHandler(async (req, res) => {
  const rating = Number(req.body.rating);
  const comment = (req.body.comment || '').trim();
  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Please choose a rating between 1 and 5');
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (product.reviews.some((r) => r.user.toString() === req.user._id.toString())) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  product.reviews.push({ user: req.user._id, name: req.user.name, rating, comment });
  product.rating = (product.rating * product.numReviews + rating) / (product.numReviews + 1);
  product.numReviews += 1;
  await product.save();

  res.status(201).json({ message: 'Thanks for your review!', product });
});
