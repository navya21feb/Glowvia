import { useState } from 'react';
import { emojiFor } from '../utils.js';

// Shows the product photo if there is one; otherwise a pretty
// colour-matched tile (so the store looks great even with no images).
export default function ProductImage({ product, size = 'card' }) {
  const [broken, setBroken] = useState(false);
  const color = /^#[0-9a-f]{6}$/i.test(product.color || '') ? product.color : '#F2B8C6';

  if (product.image && !broken) {
    return (
      <div className={`pimg ${size}`}>
        <img src={product.image} alt={product.name} onError={() => setBroken(true)} />
      </div>
    );
  }
  return (
    <div className={`pimg ${size}`} style={{ background: `linear-gradient(145deg, ${color}44, ${color}dd)` }}>
      <span className="pimg-emoji">{emojiFor(product)}</span>
      {size !== 'thumb' && <span className="pimg-brand">{product.brand}</span>}
    </div>
  );
}
