import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../api.js';
import ProductImage from '../../components/ProductImage.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { CATEGORIES, inr } from '../../utils.js';

const BLANK = {
  name: '', brand: '', category: 'Skincare', subCategory: '', price: '', mrp: '',
  stock: '', color: '#F2B8C6', image: '', description: '', featured: false,
};

export default function ProductsManager() {
  const { user } = useAuth();
  const [products, setProducts] = useState(null);
  const [form, setForm] = useState(null); // null = modal closed
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/products/mine').then((r) => setProducts(r.data.products));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const save = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      mrp: form.mrp === '' ? undefined : Number(form.mrp),
      stock: Number(form.stock),
    };
    try {
      setSaving(true);
      if (form._id) await api.put(`/products/${form._id}`, payload);
      else await api.post('/products', payload);
      toast.success(form._id ? 'Product updated' : 'Product added');
      setForm(null);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${p._id}`);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  if (!products) return <div className="empty"><div className="spinner" /></div>;

  return (
    <>
      <div className="section-head">
        <h3>{user.role === 'admin' ? 'All products' : 'My products'} ({products.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setForm({ ...BLANK })}>+ Add product</button>
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th>{user.role === 'admin' && <th>Seller</th>}<th></th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>
                  <div className="cell-product">
                    <ProductImage product={p} size="thumb" />
                    <div>
                      <Link className="link" to={`/product/${p._id}`}>{p.name}</Link>
                      <small>{p.brand}{p.featured ? ' · ⭐ featured' : ''}</small>
                    </div>
                  </div>
                </td>
                <td>{p.category}<small>{p.subCategory}</small></td>
                <td>{inr(p.price)}{p.mrp > p.price && <small><s>{inr(p.mrp)}</s></small>}</td>
                <td><b className={p.stock === 0 ? 'text-red' : p.stock <= 5 ? 'text-amber' : ''}>{p.stock}</b></td>
                {user.role === 'admin' && <td>{p.vendor?.name}</td>}
                <td className="actions">
                  <button className="btn btn-outline btn-sm" onClick={() => setForm({ ...BLANK, ...p, mrp: p.mrp || '' })}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(p)}>Delete</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan="6" className="muted center">No products yet. Add your first one!</td></tr>}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && setForm(null)}>
          <form className="modal" onSubmit={save}>
            <div className="modal-head">
              <h3>{form._id ? 'Edit product' : 'Add new product'}</h3>
              <button type="button" className="icon-btn" onClick={() => setForm(null)}>✕</button>
            </div>

            <div className="form-grid">
              <label className="field full"><span>Product name</span><input value={form.name} onChange={set('name')} required /></label>
              <label className="field"><span>Brand</span><input value={form.brand} onChange={set('brand')} required /></label>
              <label className="field"><span>Category</span>
                <select value={form.category} onChange={set('category')}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="field"><span>Type (e.g. Serum, Lipstick)</span><input value={form.subCategory} onChange={set('subCategory')} required /></label>
              <label className="field"><span>Selling price (₹)</span><input type="number" min="1" value={form.price} onChange={set('price')} required /></label>
              <label className="field"><span>MRP (₹, optional)</span><input type="number" min="0" value={form.mrp} onChange={set('mrp')} /></label>
              <label className="field"><span>Stock</span><input type="number" min="0" value={form.stock} onChange={set('stock')} required /></label>
              <label className="field"><span>Shade / theme colour</span><input type="color" value={form.color} onChange={set('color')} /></label>
              <label className="field full"><span>Image URL (optional)</span><input value={form.image} onChange={set('image')} placeholder="https://…  (leave empty for a colour tile)" /></label>
              <label className="field full"><span>Description</span><textarea rows="3" value={form.description} onChange={set('description')} /></label>
              <label className="check full"><input type="checkbox" checked={!!form.featured} onChange={set('featured')} /> Show in “Bestsellers” on the home page</label>
            </div>

            <div className="modal-foot">
              <button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save product'}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
