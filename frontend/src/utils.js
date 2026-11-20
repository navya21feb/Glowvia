export const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

// Keep in sync with backend/utils/pricing.js (the server is the source of truth)
export const FREE_SHIPPING_MIN = 999;
export const SHIPPING_FEE = 79;

export const CATEGORIES = ['Skincare', 'Makeup', 'Bath & Body', 'Haircare'];

const EMOJI = {
  Cleanser: '🧼', Serum: '💧', Moisturizer: '🧴', Sunscreen: '☀️', Toner: '🌸',
  'Night Care': '🌙', 'Eye Care': '👁️', Lipstick: '💄', 'Lip Tint': '💋',
  Foundation: '🎨', Concealer: '✨', Powder: '🪞', Blush: '🌷', Eyeliner: '🖊️',
  Mascara: '👁️', Eyeshadow: '🎨', 'Setting Spray': '💦', Brows: '🪄',
  'Body Care': '🧴', Scrub: '☕', 'Hair Oil': '🌿', Shampoo: '🚿',
};

export const emojiFor = (p) => EMOJI[p.subCategory] || (p.category === 'Makeup' ? '💄' : '🧴');

export const discountPct = (p) =>
  p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const shortId = (id) => String(id).slice(-6).toUpperCase();
