import { Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

// Blocks a page unless the user is logged in (and has one of the allowed roles)
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="container empty"><div className="spinner" /></div>;

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  if (roles && !roles.includes(user.role)) {
    toast.error('You do not have access to that page');
    return <Navigate to="/" replace />;
  }
  return children;
}
