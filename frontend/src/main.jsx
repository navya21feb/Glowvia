import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            style: { borderRadius: '999px', background: '#3E1F33', color: '#fff', fontSize: '14px' },
          }}
        />
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);
