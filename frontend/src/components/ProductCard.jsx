import { Link } from 'react-router-dom';
import ProductImage from './ProductImage.jsx';
import Stars from './Stars.jsx';
import { useCart } from '../context/CartContext.jsx';
import { inr, discountPct } from '../utils.js';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const off = discountPct(product);

  return (
    <article className="pcard">
      <Link to={`/product/${product._id}`} className="pcard-media">
        <ProductImage product={product} />
        {off > 0 && <span className="badge badge-off">{off}% OFF</span>}
        {product.stock === 0 && <span className="badge badge-out">Sold out</span>}
        {product.stock > 0 && product.stock <= 5 && <span className="badge badge-low">Only {product.stock} left</span>}
      </Link>
      <div className="pcard-body">
        <span className="pcard-brand">{product.brand}</span>
        <Link to={`/product/${product._id}`} className="pcard-name">{product.name}</Link>
        <Stars value={product.rating} count={product.numReviews} />
        <div className="pcard-bottom">
          <div className="price">
            <b>{inr(product.price)}</b>
            {off > 0 && <s>{inr(product.mrp)}</s>}
          </div>
          <button
            className="btn btn-primary btn-sm"
            disabled={product.stock === 0}
            onClick={() => addToCart(product, 1)}
          >
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
