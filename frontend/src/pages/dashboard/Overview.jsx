import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { inr, fmtDate, shortId } from '../../utils.js';

export default function Overview() {
  const { user } = useAuth();
  const [s, setS] = useState(null);

  useEffect(() => {
    api.get('/orders/stats').then((r) => setS(r.data));
  }, []);

  if (!s) return <div className="empty"><div className="spinner" /></div>;

  const max = Math.max(...s.sales.map((d) => d.total), 1);

  return (
    <>
      <div className="stat-grid">
        <div className="stat"><span>💰</span><small>Revenue</small><b>{inr(s.revenue)}</b></div>
        <div className="stat"><span>📦</span><small>Orders</small><b>{s.orderCount}</b></div>
        <div className="stat"><span>💄</span><small>{user.role === 'admin' ? 'Products' : 'My products'}</small><b>{s.productCount}</b></div>
        {user.role === 'admin' && <div className="stat"><span>👥</span><small>Customers</small><b>{s.customers}</b></div>}
      </div>

      <div className="dash-grid">
        <div className="card">
          <h3>Sales – last 7 days</h3>
          <div className="bars">
            {s.sales.map((d) => (
              <div className="bar-col" key={d.label} title={inr(d.total)}>
                <small>{d.total ? inr(d.total) : ''}</small>
                <div className="bar" style={{ height: `${(d.total / max) * 100}%` }} />
                <span>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Orders by status</h3>
          {Object.keys(s.byStatus).length === 0 && <p className="muted">No orders yet.</p>}
          {Object.entries(s.byStatus).map(([k, v]) => (
            <div className="sum-row" key={k}><span className={`status status-${k.toLowerCase()}`}>{k}</span><b>{v}</b></div>
          ))}

          <h3 className="mt">Low stock</h3>
          {s.lowStock.length === 0 && <p className="muted">All products are well stocked 🎉</p>}
          {s.lowStock.map((p) => (
            <div className="sum-row" key={p._id}><span>{p.name}</span><b className={p.stock === 0 ? 'text-red' : 'text-amber'}>{p.stock} left</b></div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Recent orders</h3>
        {s.recent.length === 0 ? (
          <p className="muted">Orders will appear here once customers start buying.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {s.recent.map((o) => (
                  <tr key={o._id}>
                    <td><Link className="link" to={`/orders/${o._id}`}>#{shortId(o._id)}</Link></td>
                    <td>{o.customer}</td>
                    <td>{fmtDate(o.createdAt)}</td>
                    <td>{inr(o.total)}</td>
                    <td><span className={`status status-${o.status.toLowerCase()}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
