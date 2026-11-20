import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { inr, fmtDate, shortId } from '../utils.js';

const EMPTY = { fullName: '', phone: '', line1: '', city: '', state: '', pincode: '' };

export default function Account() {
  const { user, setUser } = useAuth();
  const [orders, setOrders] = useState(null);
  const [name, setName] = useState(user.name);
  const [address, setAddress] = useState({ ...EMPTY, ...(user.address || {}) });

  useEffect(() => {
    api.get('/orders/mine').then((r) => setOrders(r.data.orders));
  }, []);

  const set = (k) => (e) => setAddress({ ...address, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    try {
      const r = await api.put('/auth/profile', { name, address });
      setUser(r.data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <div className="container">
      <h1 className="page-title">My account</h1>
      <p className="muted">{user.email} · <span className="role-pill">{user.role}</span></p>

      <div className="account-grid">
        <form className="card" onSubmit={save}>
          <h3>Profile & default address</h3>
          <div className="form-grid">
            <label className="field full"><span>Name</span><input value={name} onChange={(e) => setName(e.target.value)} /></label>
            <label className="field"><span>Full name (delivery)</span><input value={address.fullName} onChange={set('fullName')} /></label>
            <label className="field"><span>Phone</span><input value={address.phone} onChange={set('phone')} maxLength={10} /></label>
            <label className="field full"><span>Address</span><input value={address.line1} onChange={set('line1')} /></label>
            <label className="field"><span>City</span><input value={address.city} onChange={set('city')} /></label>
            <label className="field"><span>State</span><input value={address.state} onChange={set('state')} /></label>
            <label className="field"><span>PIN code</span><input value={address.pincode} onChange={set('pincode')} maxLength={6} /></label>
          </div>
          <button className="btn btn-primary">Save changes</button>
        </form>

        <div>
          <h3 className="orders-title">Order history</h3>
          {orders === null ? (
            <div className="spinner" />
          ) : orders.length === 0 ? (
            <div className="card empty small">
              <p className="muted">You haven't placed any orders yet.</p>
              <Link to="/shop" className="btn btn-primary btn-sm">Start shopping</Link>
            </div>
          ) : (
            orders.map((o) => (
              <Link to={`/orders/${o._id}`} className="card order-row" key={o._id}>
                <div>
                  <b>#{shortId(o._id)}</b>
                  <small>{fmtDate(o.createdAt)} · {o.items.reduce((s, i) => s + i.qty, 0)} item(s)</small>
                </div>
                <div className="order-row-right">
                  <b>{inr(o.totalPrice)}</b>
                  <span className={`status status-${o.status.toLowerCase()}`}>{o.status}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
