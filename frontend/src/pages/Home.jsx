import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

const TILES = [
  { name: 'Skincare', emoji: '🧴', note: 'Serums, SPF & more', bg: 'linear-gradient(135deg,#FBE7EA,#F7C6D3)' },
  { name: 'Makeup', emoji: '💄', note: 'Lips, eyes & face', bg: 'linear-gradient(135deg,#F9E0D0,#F4B79A)' },
  { name: 'Bath & Body', emoji: '🛁', note: 'Lotions & scrubs', bg: 'linear-gradient(135deg,#E3F4EA,#B7E4C7)' },
  { name: 'Haircare', emoji: '🌿', note: 'Oils & shampoos', bg: 'linear-gradient(135deg,#EDE4FA,#CDB9F2)' },
];

const PERKS = [
  ['🚚', 'Free shipping', 'On orders above ₹999'],
  ['✅', '100% authentic', 'Sourced directly from brands'],
  ['↩️', 'Easy returns', '7-day no-fuss returns'],
  ['🔒', 'Secure checkout', 'Safe & encrypted payments'],
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [fresh, setFresh] = useState([]);

  useEffect(() => {
    api.get('/products?featured=true&limit=8&sort=popular').then((r) => setFeatured(r.data.products));
    api.get('/products?limit=4&sort=newest').then((r) => setFresh(r.data.products));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-text">
            <span className="eyebrow">New season · Glow edit</span>
            <h1>Skin first.<br />Glow always.</h1>
            <p>
              Dermatologist-approved skincare and richly pigmented makeup, picked to make your
              everyday routine simple and your skin happy.
            </p>
            <div className="hero-cta">
              <Link to="/shop" className="btn btn-primary btn-lg">Shop now</Link>
              <Link to="/shop?category=Skincare" className="btn btn-outline btn-lg">Explore skincare</Link>
            </div>
            <div className="hero-stats">
              <div><b>28+</b><span>Products</span></div>
              <div><b>4.5★</b><span>Avg. rating</span></div>
              <div><b>10k+</b><span>Happy skins</span></div>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="blob" />
            <div className="float f1">💄</div>
            <div className="float f2">🧴</div>
            <div className="float f3">✨</div>
            <div className="float f4">🌸</div>
            <div className="hero-card">
              <span>Bestseller</span>
              <b>Vitamin C Serum</b>
              <small>₹699 <s>₹899</s></small>
            </div>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="container perks">
        {PERKS.map(([icon, title, sub]) => (
          <div className="perk" key={title}>
            <span>{icon}</span>
            <div><b>{title}</b><small>{sub}</small></div>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section className="container section">
        <div className="section-head">
          <h2>Shop by category</h2>
        </div>
        <div className="tiles">
          {TILES.map((t) => (
            <Link key={t.name} to={`/shop?category=${encodeURIComponent(t.name)}`} className="tile" style={{ background: t.bg }}>
              <span className="tile-emoji">{t.emoji}</span>
              <h3>{t.name}</h3>
              <small>{t.note}</small>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="container section">
        <div className="section-head">
          <h2>Bestsellers</h2>
          <Link to="/shop?sort=popular" className="link">View all →</Link>
        </div>
        <div className="grid-products">
          {featured.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      {/* Promo banner */}
      <section className="container">
        <div className="promo">
          <div>
            <span className="eyebrow light">Limited time</span>
            <h2>Your first glow-up, 15% off</h2>
            <p>Use code <b>WELCOME15</b> on orders above ₹999. Or grab <b>GLOW10</b> for 10% off ₹499+.</p>
          </div>
          <Link to="/shop" className="btn btn-light btn-lg">Start shopping</Link>
        </div>
      </section>

      {/* New arrivals */}
      <section className="container section">
        <div className="section-head">
          <h2>Just landed</h2>
          <Link to="/shop?sort=newest" className="link">See what's new →</Link>
        </div>
        <div className="grid-products">
          {fresh.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>
    </>
  );
}
