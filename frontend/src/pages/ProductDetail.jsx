import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api.js';
import ProductImage from '../components/ProductImage.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Stars from '../components/Stars.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { inr, discountPct, fmtDate } from '../utils.js';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    setLoading(true);
    setQty(1);
    api
      .get(`/products/${id}`)
      .then((r) => {
        setProduct(r.data.product);
        return api.get(`/products?category=${encodeURIComponent(r.data.product.category)}&limit=5`);
      })
      .then((r) => setRelated(r.data.products.filter((p) => p._id !== id).slice(0, 4)))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post(`/products/${id}/reviews`, { rating, comment });
      setProduct(r.data.product);
      setComment('');
      toast.success(r.data.message);
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const buyNow = async () => {
    if (await addToCart(product, qty)) navigate('/cart');
  };

  if (loading) return <div className="container empty"><div className="spinner" /></div>;
  if (!product)
    return (
      <div className="container empty">
        <h2>Product not found</h2>
        <Link to="/shop" className="btn btn-primary">Back to shop</Link>
      </div>
    );

  const off = discountPct(product);
  const out = product.stock === 0;

  return (
    <div className="container">
      <div className="crumbs">
        <Link to="/">Home</Link> / <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link> / <span>{product.name}</span>
      </div>

      <div className="detail">
        <ProductImage product={product} size="large" />

        <div className="detail-info">
          <span className="pcard-brand">{product.brand}</span>
          <h1>{product.name}</h1>
          <Stars value={product.rating} count={product.numReviews} />

          <div className="detail-price">
            <b>{inr(product.price)}</b>
            {off > 0 && (
              <>
                <s>{inr(product.mrp)}</s>
                <span className="badge badge-off static">{off}% OFF</span>
              </>
            )}
          </div>
          <small className="muted">Inclusive of all taxes</small>

          <p className="detail-desc">{product.description}</p>

          <ul className="detail-meta">
            <li><span>Category</span>{product.category} · {product.subCategory}</li>
            <li><span>Sold by</span>{product.vendor?.name || 'Glowvia'}</li>
            <li>
              <span>Availability</span>
              {out ? <b className="text-red">Out of stock</b> : product.stock <= 5 ? <b className="text-amber">Only {product.stock} left</b> : <b className="text-green">In stock</b>}
            </li>
          </ul>

          {!out && (
            <div className="detail-actions">
              <div className="qty">
                <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease">−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} aria-label="Increase">+</button>
              </div>
              <button className="btn btn-primary btn-lg" onClick={() => addToCart(product, qty)}>Add to bag</button>
              <button className="btn btn-outline btn-lg" onClick={buyNow}>Buy now</button>
            </div>
          )}
          {out && <button className="btn btn-primary btn-lg" disabled>Sold out</button>}
        </div>
      </div>

      {/* Reviews */}
      <section className="reviews">
        <h2>Customer reviews</h2>
        <div className="reviews-grid">
          <div>
            {(product.reviews || []).length === 0 ? (
              <p className="muted">No written reviews yet. Be the first to share your thoughts!</p>
            ) : (
              [...product.reviews].reverse().map((r) => (
                <div className="review" key={r._id}>
                  <div className="review-head">
                    <b>{r.name}</b>
                    <Stars value={r.rating} />
                    <small className="muted">{fmtDate(r.createdAt)}</small>
                  </div>
                  {r.comment && <p>{r.comment}</p>}
                </div>
              ))
            )}
          </div>

          <div className="card review-form">
            <h3>Write a review</h3>
            {user ? (
              <form onSubmit={submitReview}>
                <div className="rate-pick">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button type="button" key={n} className={n <= rating ? 'on' : ''} onClick={() => setRating(n)} aria-label={`${n} stars`}>★</button>
                  ))}
                </div>
                <textarea
                  rows="4"
                  placeholder="How did this product work for you?"
                  value={comment}
                  maxLength={500}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button className="btn btn-primary" type="submit">Submit review</button>
              </form>
            ) : (
              <p className="muted">Please <Link to="/login" state={{ from: `/product/${id}` }} className="link">log in</Link> to review this product.</p>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section">
          <div className="section-head"><h2>You may also like</h2></div>
          <div className="grid-products">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
