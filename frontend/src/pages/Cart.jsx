import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductImage from '../components/ProductImage.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { inr, FREE_SHIPPING_MIN } from '../utils.js';

export default function Cart() {
  const { items, count, subtotal, discount, shipping, total, coupon, busy,
    updateQty, removeItem, clearCart, applyCoupon, removeCoupon } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  const apply = async (e) => {
    e.preventDefault();
    if (code.trim() && (await applyCoupon(code))) setCode('');
  };

  const checkout = () => {
    if (!user) navigate('/login', { state: { from: '/checkout' } });
    else navigate('/checkout');
  };

  if (items.length === 0)
    return (
      <div className="container empty">
        <div className="empty-emoji">🛍️</div>
        <h2>Your bag is empty</h2>
        <p className="muted">Add a few favourites and they'll show up here.</p>
        <Link to="/shop" className="btn btn-primary btn-lg">Start shopping</Link>
      </div>
    );

  const remaining = FREE_SHIPPING_MIN - subtotal;

  return (
    <div className="container">
      <h1 className="page-title">Your bag <small>({count} item{count > 1 ? 's' : ''})</small></h1>

      <div className="cart-layout">
        <div>
          {remaining > 0 ? (
            <div className="ship-bar">
              Add <b>{inr(remaining)}</b> more for <b>free shipping</b>
              <div className="progress"><span style={{ width: `${Math.min((subtotal / FREE_SHIPPING_MIN) * 100, 100)}%` }} /></div>
            </div>
          ) : (
            <div className="ship-bar ok">🎉 You've unlocked free shipping!</div>
          )}

          {items.map(({ product, qty }) => (
            <div className="cart-item" key={product._id}>
              <Link to={`/product/${product._id}`}><ProductImage product={product} size="thumb" /></Link>
              <div className="cart-item-info">
                <span className="pcard-brand">{product.brand}</span>
                <Link to={`/product/${product._id}`} className="cart-item-name">{product.name}</Link>
                <b>{inr(product.price)}</b>
                {product.stock <= 5 && <small className="text-amber">Only {product.stock} left</small>}
              </div>
              <div className="qty">
                <button disabled={busy} onClick={() => updateQty(product._id, qty - 1)} aria-label="Decrease">−</button>
                <span>{qty}</span>
                <button disabled={busy || qty >= product.stock} onClick={() => updateQty(product._id, qty + 1)} aria-label="Increase">+</button>
              </div>
              <div className="cart-item-total">{inr(product.price * qty)}</div>
              <button className="icon-btn" disabled={busy} onClick={() => removeItem(product._id)} aria-label="Remove">✕</button>
            </div>
          ))}

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => window.confirm('Remove everything from your bag?') && clearCart()}
          >
            Clear bag
          </button>
        </div>

        <aside className="card summary">
          <h3>Order summary</h3>

          {coupon ? (
            <div className="coupon-applied">
              <span>🏷️ <b>{coupon.code}</b> applied</span>
              <button className="link" onClick={removeCoupon}>Remove</button>
            </div>
          ) : (
            <form className="coupon-form" onSubmit={apply}>
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Coupon code" />
              <button className="btn btn-outline btn-sm" type="submit">Apply</button>
            </form>
          )}
          {!coupon && <small className="muted">Try GLOW10, WELCOME15, FLAT100 or FREESHIP</small>}

          <div className="sum-row"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
          {discount > 0 && <div className="sum-row green"><span>Discount</span><span>− {inr(discount)}</span></div>}
          <div className="sum-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : inr(shipping)}</span></div>
          <div className="sum-row total"><span>Total</span><span>{inr(total)}</span></div>

          <button className="btn btn-primary btn-lg block" onClick={checkout}>
            {user ? 'Proceed to checkout' : 'Login to checkout'}
          </button>
          <Link to="/shop" className="link center">← Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
