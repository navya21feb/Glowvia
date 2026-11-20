# ✨ Glowvia – Skincare & Makeup E-Commerce (MERN)

A complete full-stack e-commerce store built for the E-Commerce Lab (BIT 417).
**MongoDB + Express + React (Vite) + Node.js**, with JWT auth, role-based access (customer / vendor / admin),
server-side cart, coupons, orders, reviews and an admin/vendor dashboard.

---

## 1. Setup (about 5 minutes)

**Prerequisites:** Node.js 18+ and either MongoDB installed locally *or* a free MongoDB Atlas cluster.

### Backend
```bash
cd backend
npm install
```
Open `backend/.env` and check `MONGO_URI`:
- Local MongoDB: leave `mongodb://127.0.0.1:27017/glowvia`
- MongoDB Atlas: paste your connection string, e.g. `mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/glowvia`

Then load the demo data and start the server:
```bash
npm run seed     # creates 28 products, 3 users, 4 coupons
npm run dev      # API on http://localhost:5000
```
You should see: `Server is running on port 5000` and `MongoDB Connected Successfully!`

### Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev      # opens http://localhost:5173
```

---

## 2. Demo logins

| Role     | Email                  | Password       |
|----------|------------------------|----------------|
| Customer | customer@glowvia.com   | Customer@123   |
| Vendor   | vendor@glowvia.com     | Vendor@123     |
| Admin    | admin@glowvia.com      | Admin@123      |

Coupons to try in the bag: `GLOW10`, `WELCOME15`, `FLAT100`, `FREESHIP`.

---

## 3. Features

- Home page, category tiles, bestsellers, new arrivals
- Shop with search, category/type/brand/price filters, sorting and pagination
- Product page with discount, stock status, quantity, reviews and ratings
- Guest cart (localStorage) that merges into the database cart on login
- Dynamic cart: add / remove / change quantity, live totals, free-shipping progress bar
- Coupons (percent, flat, free shipping) validated on the server
- Checkout with address + payment method (COD, or simulated UPI/Card)
- Orders with status timeline, cancel (restocks items), order history
- **RBAC:** customers shop · vendors manage *their own* products and see their orders · admins manage everything (products, orders, users, coupons)
- Dashboard with revenue stats, 7-day sales chart, low-stock alerts

---

## 4. Lab report guide – which file to screenshot for which experiment

| # | Experiment | Show this |
|---|------------|-----------|
| 1 | MERN architecture | Folder structure, `backend/server.js`, `backend/config/db.js`, `.env`, terminal "Server is running… MongoDB Connected" |
| 2 | Homepage & navigation (React Router) | `frontend/src/App.jsx` (routes), `components/Navbar.jsx`, `pages/Home.jsx` + homepage screenshot |
| 3 | Core modules (catalog, offers, orders) | `models/Product.js`, `models/Coupon.js`, `models/Order.js`, `pages/Shop.jsx`, `pages/Cart.jsx` (coupon) |
| 4 | Middleware & routing | `middleware/auth.js`, `middleware/error.js`, `routes/*.js`, `server.js` (`cors`, `express.json`, `morgan`) |
| 5 | REST APIs | `controllers/*.js`, test in Postman: `GET /api/products`, `POST /api/auth/login`, `POST /api/orders` |
| 6 | RBAC | `authorize()` in `middleware/auth.js`, `routes/productRoutes.js`, `components/ProtectedRoute.jsx`, `pages/Dashboard.jsx` – screenshot dashboard as admin vs vendor vs customer (no Dashboard link) |
| 7 | Session management (JWT) | `utils/generateToken.js`, `protect` in `middleware/auth.js`, `AuthContext.jsx`, DevTools → Application → Local Storage → `glowvia_token` |
| 8 | MongoDB Atlas | Atlas Data Explorer showing `users`, `products`, `orders`, `carts`, `coupons` collections |
| 9 | Deployment | See section 5 below |
| 10 | Shopping cart | `models/Cart.js`, `controllers/cartController.js`, `context/CartContext.jsx`, `pages/Cart.jsx` + screenshots |

### API quick reference
```
POST   /api/auth/register | /api/auth/login        GET /api/auth/me
GET    /api/products?search=&category=&sort=&page=   GET /api/products/:id
POST   /api/products | PUT/DELETE /api/products/:id  (vendor/admin)
POST   /api/products/:id/reviews                     (logged in)
GET    /api/cart | POST /api/cart/items | PUT/DELETE /api/cart/items/:productId
POST   /api/coupons/validate
POST   /api/orders | GET /api/orders/mine | PUT /api/orders/:id/cancel
GET    /api/orders | PUT /api/orders/:id/status      (admin / vendor view)
GET    /api/users | PUT /api/users/:id/role          (admin)
```
Protected routes need the header `Authorization: Bearer <token>` (copy the token from the login response).

---

## 5. Deployment (Experiment 9)

**Backend → Render** (Web Service, root directory `backend`)
- Build command: `npm install` · Start command: `npm start`
- Environment variables: `MONGO_URI` (Atlas string), `JWT_SECRET`, `CLIENT_URL` (your Vercel URL)
- In Atlas → Network Access, allow `0.0.0.0/0` so Render can connect.

**Frontend → Vercel** (root directory `frontend`, framework: Vite)
- Environment variable: `VITE_API_URL` = `https://<your-render-app>.onrender.com/api`
- Add a `vercel.json` in `frontend/` so page refreshes work:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
  ```

---

## 6. Notes

- Product photos are optional: without an image URL the store shows colour-matched tiles. Vendors/admins can paste image URLs when adding products.
- UPI/Card payments are **simulated** (no real money). Razorpay can be plugged into `orderController.createOrder` later.
- Prices are always calculated on the server from the database, so users can't tamper with totals.
- Never commit your real `.env` to GitHub. Rotate any password you accidentally share.
