import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { CATEGORIES } from '../utils.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location.pathname, location.search]);

  const submit = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/shop?search=${encodeURIComponent(q.trim())}` : '/shop');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="nav-wrap">
      <div className="announce">
        Free shipping above ₹999 &nbsp;•&nbsp; Use code <b>GLOW10</b> for 10% off
      </div>
      <nav className="nav container">
        <Link to="/" className="logo">
          Glow<span>via</span>
        </Link>

        <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? '✕' : '☰'}
        </button>

        <div className={`nav-menu ${open ? 'open' : ''}`}>
          <div className="nav-links">
            <NavLink to="/shop" end>Shop all</NavLink>
            {CATEGORIES.map((c) => (
              <Link key={c} to={`/shop?category=${encodeURIComponent(c)}`}>{c}</Link>
            ))}
          </div>

          <form className="nav-search" onSubmit={submit}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search serums, lipsticks…"
              aria-label="Search products"
            />
            <button type="submit" aria-label="Search">🔍</button>
          </form>

          <div className="nav-actions">
            {user ? (
              <>
                {(user.role === 'admin' || user.role === 'vendor') && (
                  <Link to="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
                )}
                <Link to="/account" className="btn btn-ghost btn-sm">Hi, {user.name.split(' ')[0]}</Link>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                <Link to="/register" className="btn btn-outline btn-sm">Sign up</Link>
              </>
            )}
            <Link to="/cart" className="bag-btn" aria-label="Shopping bag">
              🛍️{count > 0 && <span className="bag-count">{count}</span>}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
