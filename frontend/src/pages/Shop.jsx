import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

const PRICE_RANGES = [
  { label: 'Any price', min: '', max: '' },
  { label: 'Under ₹400', min: '', max: '400' },
  { label: '₹400 – ₹700', min: '400', max: '700' },
  { label: '₹700 – ₹1,000', min: '700', max: '1000' },
  { label: 'Above ₹1,000', min: '1000', max: '' },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [meta, setMeta] = useState({ categories: [], brands: [] });
  const [data, setData] = useState({ products: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const get = (k) => params.get(k) || '';

  // Update several query params at once; any filter change resets to page 1
  const update = (obj) => {
    const p = new URLSearchParams(params);
    Object.entries(obj).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    if (!('page' in obj)) p.delete('page');
    setParams(p);
  };

  useEffect(() => {
    api.get('/products/meta').then((r) => setMeta(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams(params);
    q.set('limit', '12');
    api
      .get(`/products?${q.toString()}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [params]);

  const category = get('category');
  const subs = meta.categories.find((c) => c.name === category)?.subCategories || [];
  const rangeIdx = PRICE_RANGES.findIndex((r) => r.min === get('minPrice') && r.max === get('maxPrice'));
  const hasFilters = ['category', 'subCategory', 'brand', 'minPrice', 'maxPrice', 'search'].some(get);

  return (
    <div className="container shop">
      <div className="shop-head">
        <div>
          <h1>{get('search') ? `Results for “${get('search')}”` : category || 'All products'}</h1>
          <p className="muted">{loading ? 'Loading…' : `${data.total} product${data.total === 1 ? '' : 's'}`}</p>
        </div>
        <div className="shop-tools">
          <button className="btn btn-outline btn-sm filter-toggle" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? 'Hide filters' : 'Filters'}
          </button>
          <select value={get('sort') || 'newest'} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort">
            <option value="newest">Newest</option>
            <option value="popular">Most popular</option>
            <option value="rating">Top rated</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      </div>

      <div className="shop-layout">
        <aside className={`filters ${showFilters ? 'show' : ''}`}>
          <div className="filter-block">
            <h4>Category</h4>
            <button className={`chip ${!category ? 'active' : ''}`} onClick={() => update({ category: '', subCategory: '' })}>All</button>
            {meta.categories.map((c) => (
              <button
                key={c.name}
                className={`chip ${category === c.name ? 'active' : ''}`}
                onClick={() => update({ category: c.name, subCategory: '' })}
              >
                {c.name} <small>{c.count}</small>
              </button>
            ))}
          </div>

          {subs.length > 0 && (
            <div className="filter-block">
              <h4>Type</h4>
              {subs.map((s) => (
                <button
                  key={s}
                  className={`chip ${get('subCategory') === s ? 'active' : ''}`}
                  onClick={() => update({ subCategory: get('subCategory') === s ? '' : s })}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="filter-block">
            <h4>Price</h4>
            {PRICE_RANGES.map((r, i) => (
              <label key={r.label} className="radio">
                <input
                  type="radio"
                  name="price"
                  checked={rangeIdx === i || (rangeIdx === -1 && i === 0)}
                  onChange={() => update({ minPrice: r.min, maxPrice: r.max })}
                />
                {r.label}
              </label>
            ))}
          </div>

          <div className="filter-block">
            <h4>Brand</h4>
            <select value={get('brand')} onChange={(e) => update({ brand: e.target.value })}>
              <option value="">All brands</option>
              {meta.brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={() => setParams({})}>Clear all filters</button>
          )}
        </aside>

        <section>
          {loading ? (
            <div className="empty"><div className="spinner" /></div>
          ) : data.products.length === 0 ? (
            <div className="empty">
              <div className="empty-emoji">🔍</div>
              <h3>No products found</h3>
              <p className="muted">Try a different search or clear a few filters.</p>
              <button className="btn btn-primary" onClick={() => setParams({})}>Clear filters</button>
            </div>
          ) : (
            <div className="grid-products">
              {data.products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          {data.pages > 1 && (
            <div className="pagination">
              <button className="btn btn-outline btn-sm" disabled={data.page <= 1} onClick={() => update({ page: String(data.page - 1) })}>← Prev</button>
              <span>Page {data.page} of {data.pages}</span>
              <button className="btn btn-outline btn-sm" disabled={data.page >= data.pages} onClick={() => update({ page: String(data.page + 1) })}>Next →</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
