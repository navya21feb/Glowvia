import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api.js';
import ProductImage from '../components/ProductImage.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { inr } from '../utils.js';

const PAYMENTS = [
  { id: 'COD', label: 'Cash on delivery', note: 'Pay when your order arrives' },
  { id: 'UPI', label: 'UPI (demo)', note: 'Simulated payment – no real money' },
  { id: 'CARD', label: 'Credit / Debit card (demo)', note: 'Simulated payment – no real money' },
];

const EMPTY = { fullName: '', phone: '', line1: '', city: '', state: '', pincode: '' };

export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, discount, shipping, total, coupon, resetCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({ ...EMPTY, fullName: user?.name || '', ...(user?.address || {}) });
  const [payment, setPayment] = useState('COD');
  const [placing, setPlacing] = useState(false);

  // Fill the saved address if it arrives after the first render
  useEffect(() => {
    if (user?.address) setForm((f) => ({ ...f, ...user.address }));
  }, [user?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    if (Object.values(form).some((v) => !String(v).trim())) return 'Please fill in all address fields';
    if (!/^\d{10}$/.test(form.phone.trim())) return 'Enter a valid 10-digit phone number';
    if (!/^\d{6}$/.test(form.pincode.trim())) return 'Enter a valid 6-digit PIN code';
    return null;
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) return toast.error(problem);

    try {
      setPlacing(true);
      const r = await api.post('/orders', {
        shippingAddress: form,
        paymentMethod: payment,
        couponCode: coupon?.code,
      });
      resetCart();
      navigate(`/orders/${r.data.order._id}`, { state: { justPlaced: true } });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0)
    return (
      <div className="container empty">
        <h2>Your bag is empty</h2>
        <Link to="/shop" className="btn btn-primary">Go shopping</Link>
      </div>
    );

  return (
    <div className="container">
      <h1 className="page-title">Checkout</h1>

      <form className="cart-layout" onSubmit={placeOrder}>
        <div>
          <div className="card">
            <h3>1. Shipping address</h3>
            <div className="form-grid">
              <label className="field"><span>Full name</span><input value={form.fullName} onChange={set('fullName')} /></label>
              <label className="field"><span>Phone</span><input value={form.phone} onChange={set('phone')} maxLength={10} inputMode="numeric" /></label>
              <label className="field full"><span>Address</span><input value={form.line1} onChange={set('line1')} placeholder="House no., street, area" /></label>
              <label className="field"><span>City</span><input value={form.city} onChange={set('city')} /></label>
              <label className="field"><span>State</span><input value={form.state} onChange={set('state')} /></label>
              <label className="field"><span>PIN code</span><input value={form.pincode} onChange={set('pincode')} maxLength={6} inputMode="numeric" /></label>
            </div>
          </div>

          <div className="card">
            <h3>2. Payment method</h3>
            {PAYMENTS.map((p) => (
              <label key={p.id} className={`pay-option ${payment === p.id ? 'active' : ''}`}>
                <input type="radio" name="pay" checked={payment === p.id} onChange={() => setPayment(p.id)} />
                <div><b>{p.label}</b><small>{p.note}</small></div>
              </label>
            ))}
          </div>
        </div>

        <aside className="card summary">
          <h3>Order summary</h3>
          <div className="mini-items">
            {items.map(({ product, qty }) => (
              <div className="mini-item" key={product._id}>
                <ProductImage product={product} size="thumb" />
                <div><span>{product.name}</span><small>Qty {qty}</small></div>
                <b>{inr(product.price * qty)}</b>
              </div>
            ))}
          </div>
          <div className="sum-row"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
          {discount > 0 && <div className="sum-row green"><span>Discount ({coupon?.code})</span><span>− {inr(discount)}</span></div>}
          <div className="sum-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : inr(shipping)}</span></div>
          <div className="sum-row total"><span>Total</span><span>{inr(total)}</span></div>
          <button className="btn btn-primary btn-lg block" disabled={placing}>
            {placing ? 'Placing order…' : `Place order · ${inr(total)}`}
          </button>
          <Link to="/cart" className="link center">← Back to bag</Link>
        </aside>
      </form>
    </div>
  );
}
