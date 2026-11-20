import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api.js';

const DEMOS = [
  ['Customer', 'customer@glowvia.com', 'Customer@123'],
  ['Vendor', 'vendor@glowvia.com', 'Vendor@123'],
  ['Admin', 'admin@glowvia.com', 'Admin@123'],
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={state?.from || '/'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    try {
      setBusy(true);
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.name.split(' ')[0]}!`);
      navigate(state?.from || '/', { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <form className="card auth-card" onSubmit={submit}>
        <h1>Welcome back</h1>
        <p className="muted">Log in to see your bag, orders and offers.</p>

        <label className="field"><span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </label>
        <label className="field"><span>Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button className="btn btn-primary btn-lg block" disabled={busy}>{busy ? 'Logging in…' : 'Login'}</button>

        <p className="center">New to Glowvia? <Link to="/register" state={state} className="link">Create an account</Link></p>

        <div className="demo-box">
          <small>Demo accounts (click to fill)</small>
          <div>
            {DEMOS.map(([label, e, p]) => (
              <button type="button" key={label} className="chip" onClick={() => { setEmail(e); setPassword(p); }}>{label}</button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
