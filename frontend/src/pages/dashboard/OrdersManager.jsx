import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { inr, fmtDate, shortId } from '../../utils.js';

const STATUSES = ['Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

export default function OrdersManager() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    api.get('/orders').then((r) => setOrders(r.data.orders));
  }, []);

  const changeStatus = async (id, status) => {
    try {
      const r = await api.put(`/orders/${id}/status`, { status });
      setOrders((list) => list.map((o) => (o._id === id ? { ...o, status: r.data.order.status, paymentStatus: r.data.order.paymentStatus } : o)));
      toast.success(r.data.message);
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  if (!orders) return <div className="empty"><div className="spinner" /></div>;

  const shown = filter === 'All' ? orders : orders.filter((o) => o.status === filter);
  const lineTotal = (o) => (isAdmin ? o.totalPrice : o.items.reduce((s, i) => s + i.price * i.qty, 0));

  return (
    <>
      <div className="section-head">
        <h3>{isAdmin ? 'All orders' : 'Orders containing my products'} ({shown.length})</h3>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status">
          <option>All</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {!isAdmin && <p className="muted note">Vendors can view their orders. Only admins can change an order's status.</p>}

      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Order</th><th>Customer</th><th>Date</th><th>Items</th><th>{isAdmin ? 'Total' : 'My amount'}</th><th>Payment</th><th>Status</th></tr>
          </thead>
          <tbody>
            {shown.map((o) => (
              <tr key={o._id}>
                <td><Link className="link" to={`/orders/${o._id}`}>#{shortId(o._id)}</Link></td>
                <td>{o.user?.name}<small>{o.user?.email}</small></td>
                <td>{fmtDate(o.createdAt)}</td>
                <td>{o.items.reduce((s, i) => s + i.qty, 0)}</td>
                <td>{inr(lineTotal(o))}</td>
                <td>{o.paymentMethod}<small className={`pay-${o.paymentStatus.toLowerCase()}`}>{o.paymentStatus}</small></td>
                <td>
                  {isAdmin && !['Delivered', 'Cancelled'].includes(o.status) ? (
                    <select className="status-select" value={o.status} onChange={(e) => changeStatus(o._id, e.target.value)}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  ) : (
                    <span className={`status status-${o.status.toLowerCase()}`}>{o.status}</span>
                  )}
                </td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan="7" className="muted center">No orders to show.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
