import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api.js';
import ProductImage from '../components/ProductImage.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { inr, fmtDate, shortId } from '../utils.js';

const STEPS = ['Placed', 'Packed', 'Shipped', 'Delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/orders/${id}`).then((r) => setOrder(r.data.order)).catch((e) => setError(errMsg(e)));
  }, [id]);

  const cancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      const r = await api.put(`/orders/${id}/cancel`);
      setOrder({ ...order, ...r.data.order });
      toast.success('Order cancelled');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  if (error)
    return (
      <div className="container empty">
        <h2>{error}</h2>
        <Link to="/account" className="btn btn-primary">My orders</Link>
      </div>
    );
  if (!order) return <div className="container empty"><div className="spinner" /></div>;

  const isOwner = String(order.user?._id || order.user) === String(user._id);
  const cancelled = order.status === 'Cancelled';
  const stepIdx = STEPS.indexOf(order.status);
  const when = (s) => order.statusHistory?.find((h) => h.status === s)?.at;

  // Vendors only see their own line items
  const visibleItems = user.role === 'vendor' ? order.items.filter((i) => String(i.vendor) === String(user._id)) : order.items;

  return (
    <div className="container narrow">
      {state?.justPlaced && (
        <div className="success-banner">
          <div className="big">🎉</div>
          <h2>Thank you! Your order is placed.</h2>
          <p>We've sent it to our packing team. You can track it right here.</p>
        </div>
      )}

      <div className="order-head">
        <div>
          <h1>Order #{shortId(order._id)}</h1>
          <p className="muted">Placed on {fmtDate(order.createdAt)}{order.user?.name && !isOwner ? ` by ${order.user.name}` : ''}</p>
        </div>
        <span className={`status status-${order.status.toLowerCase()}`}>{order.status}</span>
      </div>

      {cancelled ? (
        <div className="card cancelled-note">This order was cancelled{order.paymentStatus === 'Refunded' ? ' and your payment has been refunded.' : '.'}</div>
      ) : (
        <div className="card timeline">
          {STEPS.map((s, i) => (
            <div key={s} className={`step ${i <= stepIdx ? 'done' : ''}`}>
              <div className="dot">{i <= stepIdx ? '✓' : i + 1}</div>
              <b>{s}</b>
              <small>{when(s) ? fmtDate(when(s)) : '—'}</small>
            </div>
          ))}
        </div>
      )}

      <div className="order-grid">
        <div className="card">
          <h3>Items</h3>
          {visibleItems.map((i) => (
            <div className="mini-item big" key={i.product}>
              <ProductImage product={i} size="thumb" />
              <div>
                <Link to={`/product/${i.product}`}>{i.name}</Link>
                <small>{i.brand} · Qty {i.qty}</small>
              </div>
              <b>{inr(i.price * i.qty)}</b>
            </div>
          ))}
        </div>

        <div>
          <div className="card">
            <h3>Delivery address</h3>
            <p>
              <b>{order.shippingAddress.fullName}</b><br />
              {order.shippingAddress.line1}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}<br />
              📞 {order.shippingAddress.phone}
            </p>
          </div>

          <div className="card summary flat">
            <h3>Payment</h3>
            <div className="sum-row"><span>Method</span><span>{order.paymentMethod}</span></div>
            <div className="sum-row"><span>Status</span><span className={`pay-${order.paymentStatus.toLowerCase()}`}>{order.paymentStatus}</span></div>
            <div className="sum-row"><span>Subtotal</span><span>{inr(order.itemsPrice)}</span></div>
            {order.discount > 0 && <div className="sum-row green"><span>Discount {order.couponCode && `(${order.couponCode})`}</span><span>− {inr(order.discount)}</span></div>}
            <div className="sum-row"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : inr(order.shippingPrice)}</span></div>
            <div className="sum-row total"><span>Total</span><span>{inr(order.totalPrice)}</span></div>
          </div>

          {isOwner && ['Placed', 'Packed'].includes(order.status) && (
            <button className="btn btn-outline block" onClick={cancel}>Cancel order</button>
          )}
        </div>
      </div>

      <Link to={user.role === 'customer' ? '/account' : '/dashboard'} className="link">← Back</Link>
    </div>
  );
}
