import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api.js';
import { useAuth } from './AuthContext.jsx';
import { FREE_SHIPPING_MIN, SHIPPING_FEE } from '../utils.js';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// Guests keep their bag in localStorage; logged-in users keep it in MongoDB.
// When a guest logs in, the two are merged.
const GUEST_KEY = 'glowvia_guest_cart';
const readGuest = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY)) || [];
  } catch {
    return [];
  }
};
const slim = (p) => ({
  _id: p._id, name: p.name, brand: p.brand, price: p.price, mrp: p.mrp,
  image: p.image, color: p.color, category: p.category, subCategory: p.subCategory, stock: p.stock,
});

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState(readGuest); // [{ product, qty }]
  const [coupon, setCoupon] = useState(null); // { code, discount, freeShip }
  const [busy, setBusy] = useState(false);

  // Load / merge the cart whenever the logged-in user changes
  useEffect(() => {
    if (!user) {
      setItems(readGuest());
      setCoupon(null);
      return;
    }
    (async () => {
      try {
        const guest = readGuest();
        let res;
        if (guest.length) {
          res = await api.post('/cart/merge', {
            items: guest.map((i) => ({ productId: i.product._id, qty: i.qty })),
          });
          localStorage.removeItem(GUEST_KEY);
        } else {
          res = await api.get('/cart');
        }
        setItems(res.data.items);
      } catch (e) {
        toast.error(errMsg(e));
      }
    })();
  }, [user?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- derived totals ----------
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.product.price * i.qty, 0), [items]);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const discount = coupon?.discount || 0;
  const shipping =
    items.length === 0 ? 0 : subtotal >= FREE_SHIPPING_MIN || coupon?.freeShip ? 0 : SHIPPING_FEE;
  const total = Math.max(subtotal - discount + shipping, 0);

  // Re-check the coupon when the bag changes (min-order rules, % amounts)
  useEffect(() => {
    if (!coupon) return;
    if (items.length === 0) {
      setCoupon(null);
      return;
    }
    api
      .post('/coupons/validate', { code: coupon.code, subtotal })
      .then((r) => {
        if (r.data.discount !== coupon.discount || r.data.freeShip !== coupon.freeShip)
          setCoupon({ code: r.data.code, discount: r.data.discount, freeShip: r.data.freeShip });
      })
      .catch((e) => {
        toast.error(errMsg(e));
        setCoupon(null);
      });
  }, [subtotal]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- actions ----------
  const saveGuest = (list) => {
    localStorage.setItem(GUEST_KEY, JSON.stringify(list));
    setItems(list);
  };

  const run = async (fn) => {
    try {
      setBusy(true);
      await fn();
      return true;
    } catch (e) {
      toast.error(errMsg(e));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const addToCart = (product, qty = 1) =>
    run(async () => {
      if (product.stock < 1) throw new Error('Sorry, this product is out of stock');
      if (user) {
        const r = await api.post('/cart/items', { productId: product._id, qty });
        setItems(r.data.items);
      } else {
        const list = [...items];
        const idx = list.findIndex((i) => i.product._id === product._id);
        const current = idx > -1 ? list[idx].qty : 0;
        const q = Math.min(current + qty, product.stock);
        if (idx > -1) list[idx] = { ...list[idx], qty: q };
        else list.push({ product: slim(product), qty: q });
        saveGuest(list);
      }
      toast.success('Added to your bag 🛍️');
    });

  const removeItem = (productId) =>
    run(async () => {
      if (user) {
        const r = await api.delete(`/cart/items/${productId}`);
        setItems(r.data.items);
      } else saveGuest(items.filter((i) => i.product._id !== productId));
    });

  const updateQty = (productId, qty) => {
    if (qty < 1) return removeItem(productId);
    return run(async () => {
      if (user) {
        const r = await api.put(`/cart/items/${productId}`, { qty });
        setItems(r.data.items);
      } else {
        saveGuest(
          items.map((i) =>
            i.product._id === productId ? { ...i, qty: Math.min(qty, i.product.stock) } : i
          )
        );
      }
    });
  };

  const clearCart = () =>
    run(async () => {
      if (user) {
        const r = await api.delete('/cart');
        setItems(r.data.items);
      } else saveGuest([]);
      setCoupon(null);
    });

  // Used after an order is placed (the server already emptied the cart)
  const resetCart = () => {
    setItems([]);
    setCoupon(null);
    localStorage.removeItem(GUEST_KEY);
  };

  const applyCoupon = async (code) => {
    try {
      const r = await api.post('/coupons/validate', { code, subtotal });
      setCoupon({ code: r.data.code, discount: r.data.discount, freeShip: r.data.freeShip });
      toast.success(`Coupon ${r.data.code} applied 🎉`);
      return true;
    } catch (e) {
      toast.error(errMsg(e));
      return false;
    }
  };

  const removeCoupon = () => setCoupon(null);

  return (
    <CartContext.Provider
      value={{
        items, count, subtotal, discount, shipping, total, coupon, busy,
        addToCart, removeItem, updateQty, clearCart, resetCart, applyCoupon, removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
