// Run with:  npm run seed
// Wipes users, products, carts, orders and coupons, then inserts demo data.
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Clearing old data...');
  await Promise.all([User.deleteMany(), Product.deleteMany(), Cart.deleteMany(), Order.deleteMany(), Coupon.deleteMany()]);

  // create() (not insertMany) so passwords get hashed by the pre-save hook
  const admin = await User.create({ name: 'Glowvia Admin', email: 'admin@glowvia.com', password: 'Admin@123', role: 'admin' });
  const vendor = await User.create({ name: 'Velvet Muse Studio', email: 'vendor@glowvia.com', password: 'Vendor@123', role: 'vendor' });
  await User.create({ name: 'Navya Sharma', email: 'customer@glowvia.com', password: 'Customer@123', role: 'customer' });

  // [brand, name, category, subCategory, price, mrp, stock, color, featured, rating, reviews, description]
  const S = 'Skincare', M = 'Makeup', B = 'Bath & Body', H = 'Haircare';
  const rows = [
    ['Dewdrop Labs', 'Hydrating Gel Cleanser', S, 'Cleanser', 349, 449, 60, '#9AD9D0', true, 4.5, 312, 'A soft, low-foam gel cleanser with glycerin and aloe that lifts away dirt and sunscreen without stripping your skin barrier. Suitable for all skin types.'],
    ['Rosewater & Co', 'Rose Milk Cleanser', S, 'Cleanser', 399, 499, 45, '#F4B6C2', false, 4.3, 148, 'Creamy cleansing milk infused with Damask rose water. Melts makeup and leaves skin cushiony and calm.'],
    ['Dewdrop Labs', 'Vitamin C 15% Brightening Serum', S, 'Serum', 699, 899, 40, '#FFB347', true, 4.6, 521, 'Stabilised 15% vitamin C with ferulic acid to fade dark spots, even tone and add everyday radiance. Use in the morning before sunscreen.'],
    ['Dewdrop Labs', 'Niacinamide 10% + Zinc Serum', S, 'Serum', 549, 699, 80, '#CBB6F2', true, 4.4, 640, 'Minimises the look of pores, balances oil and calms breakouts. Lightweight and non-sticky.'],
    ['Aurea Skin', 'Hyaluronic Acid Plumping Serum', S, 'Serum', 599, 749, 35, '#8EC9F5', false, 4.5, 203, 'Triple-weight hyaluronic acid that pulls moisture deep into skin for a bouncy, plump finish.'],
    ['Aurea Skin', 'Ceramide Barrier Moisturizer', S, 'Moisturizer', 649, 799, 50, '#F3D9B1', true, 4.7, 410, 'Rich yet breathable cream with 3 ceramides and squalane to repair and protect a stressed skin barrier.'],
    ['Petal Theory', 'Aloe Cooling Gel Moisturizer', S, 'Moisturizer', 399, 499, 70, '#A8E6A1', false, 4.2, 129, 'Oil-free aloe gel that hydrates in seconds. Perfect for oily and combination skin in humid weather.'],
    ['Aurea Skin', 'Invisible Sunscreen SPF 50 PA++++', S, 'Sunscreen', 499, 599, 90, '#FFE08A', true, 4.6, 780, 'Broad-spectrum, zero white cast, no greasy shine. Sits beautifully under makeup and is water resistant.'],
    ['Aurea Skin', 'Retinol 0.3% Night Cream', S, 'Night Care', 899, 1099, 25, '#D9A5F0', false, 4.4, 167, 'Beginner-friendly encapsulated retinol with peptides to smooth fine lines and refine texture while you sleep.'],
    ['Petal Theory', 'Overnight Sleeping Mask', S, 'Night Care', 749, 899, 30, '#F7C6D9', false, 4.3, 96, 'A jelly-like overnight mask with bakuchiol and honey extract. Wake up to soft, rested skin.'],
    ['Rosewater & Co', 'Rose Hydrating Toner', S, 'Toner', 399, 479, 55, '#F9C5D1', false, 4.1, 88, 'Alcohol-free mist-style toner that preps skin to absorb serums and sets makeup with a dewy veil.'],
    ['Dewdrop Labs', 'Caffeine Under-Eye Cream', S, 'Eye Care', 549, 649, 28, '#C7B299', false, 4.0, 74, 'Cooling roll-on cream with caffeine and vitamin K to depuff and brighten tired eyes.'],

    ['Velvet Muse', 'Velvet Matte Lipstick – Ruby Red', M, 'Lipstick', 449, 549, 60, '#B5173B', true, 4.6, 356, 'Intense one-swipe colour in a weightless velvet-matte finish that lasts up to 8 hours without drying lips.'],
    ['Velvet Muse', 'Velvet Matte Lipstick – Nude Rose', M, 'Lipstick', 449, 549, 48, '#C98A85', true, 4.5, 301, 'Your-lips-but-better rosy nude. A flattering everyday shade for every skin tone.'],
    ['Velvet Muse', 'Glossy Plump Lip Tint – Cherry', M, 'Lip Tint', 349, 429, 65, '#E0405F', false, 4.2, 119, 'Juicy tint-and-gloss hybrid with a subtle plumping tingle and a sheer cherry flush.'],
    ['Velvet Muse', 'Skin-Fit Serum Foundation – Natural Beige', M, 'Foundation', 799, 999, 30, '#E0B48F', true, 4.4, 244, 'Medium buildable coverage with skincare serum benefits. A natural, second-skin finish that does not cake.'],
    ['Velvet Muse', 'Full Coverage Concealer – Light Medium', M, 'Concealer', 399, 499, 40, '#EBC9A3', false, 4.3, 187, 'Creamy, crease-proof coverage that hides dark circles and blemishes for up to 12 hours.'],
    ['Velvet Muse', 'Silk Finish Compact Powder', M, 'Powder', 349, 449, 52, '#F0D5B8', false, 4.0, 92, 'Finely milled powder that controls shine and blurs pores without a flat, powdery look.'],
    ['Velvet Muse', 'Cream Blush – Peach Glow', M, 'Blush', 399, 499, 36, '#F4A58A', true, 4.5, 211, 'Buttery cream blush that melts into skin for a lit-from-within flush. Blend with fingers or a brush.'],
    ['Velvet Muse', 'Smudge-Proof Kohl Eyeliner – Black', M, 'Eyeliner', 249, 299, 100, '#2B2B2B', false, 4.1, 265, 'Ultra-black, creamy kohl that glides on easily and stays put through the longest days.'],
    ['Velvet Muse', 'Lengthening Mascara – Jet Black', M, 'Mascara', 449, 549, 44, '#1F1F1F', false, 4.3, 198, 'Separates, lengthens and curls lashes with a flake-proof, smudge-resistant formula.'],
    ['Velvet Muse', 'Sunset Edit Eyeshadow Palette (9 shades)', M, 'Eyeshadow', 899, 1199, 22, '#D9825B', true, 4.7, 322, 'Nine warm mattes and shimmers in terracotta, rose and gold. Highly pigmented and easy to blend.'],
    ['Velvet Muse', 'Dewy Setting Spray', M, 'Setting Spray', 449, 549, 38, '#BFE3F5', false, 4.2, 103, 'A fine mist that locks makeup for 12 hours and gives skin a fresh, glassy finish.'],
    ['Velvet Muse', 'Brow Define Pencil – Dark Brown', M, 'Brows', 199, 249, 3, '#5A3B2E', false, 4.0, 61, 'Ultra-fine tip for hair-like strokes. Comes with a spoolie to groom and blend.'],

    ['Petal Theory', 'Shea Butter Body Lotion', B, 'Body Care', 449, 549, 58, '#F6E3B4', false, 4.5, 175, '24-hour moisture with shea butter and vitamin E. Quick absorbing, never sticky.'],
    ['Petal Theory', 'Coffee Glow Body Scrub', B, 'Scrub', 399, 499, 42, '#8B5E3C', false, 4.4, 133, 'Arabica coffee and coconut oil scrub that buffs away dullness and leaves skin silky.'],
    ['Aurea Skin', 'Argan Repair Hair Oil', H, 'Hair Oil', 549, 699, 33, '#E5B567', false, 4.5, 142, 'Lightweight argan and jojoba oil that tames frizz, adds shine and protects from heat.'],
    ['Petal Theory', 'Anti-Frizz Smooth Shampoo', H, 'Shampoo', 449, 549, 47, '#B7E4C7', false, 4.1, 84, 'Sulphate-free shampoo with keratin and aloe for smooth, manageable hair after every wash.'],
  ];

  const products = rows.map(([brand, name, category, subCategory, price, mrp, stock, color, featured, rating, numReviews, description]) => ({
    brand, name, category, subCategory, price, mrp, stock, color, featured, rating, numReviews, description,
    vendor: category === M ? vendor._id : admin._id, // makeup belongs to the vendor, the rest to admin
  }));
  await Product.insertMany(products);

  await Coupon.insertMany([
    { code: 'GLOW10', description: '10% off on orders above ₹499 (max ₹200)', type: 'percent', value: 10, maxDiscount: 200, minOrder: 499 },
    { code: 'WELCOME15', description: '15% off on orders above ₹999 (max ₹300)', type: 'percent', value: 15, maxDiscount: 300, minOrder: 999 },
    { code: 'FLAT100', description: 'Flat ₹100 off on orders above ₹799', type: 'flat', value: 100, minOrder: 799 },
    { code: 'FREESHIP', description: 'Free shipping on any order', type: 'freeship', minOrder: 0 },
  ]);

  console.log(`Seeded ${products.length} products, 3 users and 4 coupons.`);
  console.log('\nLogin accounts:');
  console.log('  admin    -> admin@glowvia.com    / Admin@123');
  console.log('  vendor   -> vendor@glowvia.com   / Vendor@123');
  console.log('  customer -> customer@glowvia.com / Customer@123');
  await mongoose.disconnect();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
