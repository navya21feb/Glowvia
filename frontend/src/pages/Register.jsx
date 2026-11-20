import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api.js';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    try {
      setBusy(true);
      const u = await register(form);
      toast.success(`Welcome to Glowvia, ${u.name.split(' ')[0]}! ✨`);
      navigate(u.role === 'vendor' ? '/dashboard' : state?.from || '/', { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <form className="card auth-card" onSubmit={submit}>
        <h1>Create your account</h1>
        <p className="muted">Join Glowvia for faster checkout and order tracking.</p>

        <label className="field"><span>Full name</span><input value={form.name} onChange={set('name')} required autoFocus /></label>
        <label className="field"><span>Email</span><input type="email" value={form.email} onChange={set('email')} required /></label>
        <label className="field"><span>Password</span><input type="password" value={form.password} onChange={set('password')} required minLength={6} /></label>

        <div className="field">
          <span>I want to</span>
          <div className="role-pick">
            <label className={form.role === 'customer' ? 'active' : ''}>
              <input type="radio" checked={form.role === 'customer'} onChange={() => setForm({ ...form, role: 'customer' })} />
              🛍️ Shop
            </label>
            <label className={form.role === 'vendor' ? 'active' : ''}>
              <input type="radio" checked={form.role === 'vendor'} onChange={() => setForm({ ...form, role: 'vendor' })} />
              🏪 Sell products
            </label>
          </div>
        </div>

        <button className="btn btn-primary btn-lg block" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        <p className="center">Already have an account? <Link to="/login" className="link">Login</Link></p>
      </form>
    </div>
  );
}
