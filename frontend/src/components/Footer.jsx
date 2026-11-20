import { Link } from 'react-router-dom';
import { CATEGORIES } from '../utils.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="logo">Glow<span>via</span></div>
          <p className="muted">Clean, effective skincare and makeup you'll actually love using. Made for every skin tone.</p>
        </div>
        <div>
          <h4>Shop</h4>
          {CATEGORIES.map((c) => (
            <Link key={c} to={`/shop?category=${encodeURIComponent(c)}`}>{c}</Link>
          ))}
        </div>
        <div>
          <h4>Help</h4>
          <Link to="/account">My orders</Link>
          <Link to="/cart">My bag</Link>
          <span>7-day easy returns</span>
          <span>support@glowvia.example</span>
        </div>
        <div>
          <h4>Why Glowvia</h4>
          <span>100% authentic products</span>
          <span>Cruelty-free picks</span>
          <span>Secure checkout</span>
        </div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} Glowvia · Built with MERN for the E-Commerce Lab</div>
    </footer>
  );
}
