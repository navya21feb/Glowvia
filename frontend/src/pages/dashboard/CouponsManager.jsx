import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../api.js';

const BLANK = { code: '', description: '', type: 'percent', value: '', maxDiscount: '', minOrder: '' };

export default function CouponsManager() {
  const [coupons, setCoupons] = useState(null);
  const [form, setForm] = useState(BLANK);

  const load = () => api.get('/coupons').then((r) => setCoupons(r.data.coupons));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coupons', {
        ...form,
        value: Number(form.value) || 0,
        maxDiscount: Number(form.maxDiscount) || 0,
        minOrder: Number(form.minOrder) || 0,
      });
      toast.success('Coupon created');
      setForm(BLANK);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const toggle = async (c) => {
    await api.put(`/coupons/${c._id}/toggle`);
    load();
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete coupon ${c.code}?`)) return;
    await api.delete(`/coupons/${c._id}`);
    load();
  };

  const describe = (c) =>
    c.type === 'percent' ? `${c.value}% off${c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ''}` : c.type === 'flat' ? `₹${c.value} off` : 'Free shipping';

  if (!coupons) return <div className="empty"><div className="spinner" /></div>;

  return (
    <div className="dash-grid">
      <div className="card table-wrap">
        <h3>Coupons ({coupons.length})</h3>
        <table>
          <thead><tr><th>Code</th><th>Offer</th><th>Min order</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id}>
                <td><b>{c.code}</b><small>{c.description}</small></td>
                <td>{describe(c)}</td>
                <td>₹{c.minOrder}</td>
                <td><span className={`status ${c.active ? 'status-delivered' : 'status-cancelled'}`}>{c.active ? 'Active' : 'Disabled'}</span></td>
                <td className="actions">
                  <button className="btn btn-outline btn-sm" onClick={() => toggle(c)}>{c.active ? 'Disable' : 'Enable'}</button>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(c)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="card" onSubmit={create}>
        <h3>Create coupon</h3>
        <div className="form-grid one">
          <label className="field"><span>Code</span><input value={form.code} onChange={set('code')} placeholder="e.g. DIWALI20" required /></label>
          <label className="field"><span>Description</span><input value={form.description} onChange={set('description')} /></label>
          <label className="field"><span>Type</span>
            <select value={form.type} onChange={set('type')}>
              <option value="percent">Percentage off</option>
              <option value="flat">Flat amount off</option>
              <option value="freeship">Free shipping</option>
            </select>
          </label>
          {form.type !== 'freeship' && (
            <label className="field"><span>{form.type === 'percent' ? 'Percent (%)' : 'Amount (₹)'}</span><input type="number" min="1" value={form.value} onChange={set('value')} required /></label>
          )}
          {form.type === 'percent' && (
            <label className="field"><span>Max discount (₹, optional)</span><input type="number" min="0" value={form.maxDiscount} onChange={set('maxDiscount')} /></label>
          )}
          <label className="field"><span>Minimum order (₹)</span><input type="number" min="0" value={form.minOrder} onChange={set('minOrder')} /></label>
        </div>
        <button className="btn btn-primary">Create coupon</button>
      </form>
    </div>
  );
}
