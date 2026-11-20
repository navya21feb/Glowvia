import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Overview from './dashboard/Overview.jsx';
import ProductsManager from './dashboard/ProductsManager.jsx';
import OrdersManager from './dashboard/OrdersManager.jsx';
import UsersManager from './dashboard/UsersManager.jsx';
import CouponsManager from './dashboard/CouponsManager.jsx';

// RBAC in the UI: admins see every tab, vendors only see their own tabs.
const TABS = [
  { id: 'overview', label: '📊 Overview', roles: ['admin', 'vendor'] },
  { id: 'products', label: '💄 Products', roles: ['admin', 'vendor'] },
  { id: 'orders', label: '📦 Orders', roles: ['admin', 'vendor'] },
  { id: 'users', label: '👥 Users', roles: ['admin'] },
  { id: 'coupons', label: '🏷️ Coupons', roles: ['admin'] },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const tabs = TABS.filter((t) => t.roles.includes(user.role));

  return (
    <div className="container">
      <div className="dash-head">
        <div>
          <h1 className="page-title">{user.role === 'admin' ? 'Admin dashboard' : 'Vendor dashboard'}</h1>
          <p className="muted">Signed in as {user.name} · <span className="role-pill">{user.role}</span></p>
        </div>
      </div>

      <div className="tabs">
        {tabs.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === 'overview' && <Overview />}
      {tab === 'products' && <ProductsManager />}
      {tab === 'orders' && <OrdersManager />}
      {tab === 'users' && user.role === 'admin' && <UsersManager />}
      {tab === 'coupons' && user.role === 'admin' && <CouponsManager />}
    </div>
  );
}
