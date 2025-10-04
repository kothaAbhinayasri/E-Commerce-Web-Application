// import { Routes, Route, Link, Navigate } from 'react-router-dom'
// import Home from './pages/Home.jsx'
// import Login from './pages/Login.jsx'
// import Signup from './pages/Signup.jsx'
// import Products from './pages/Products.jsx'
// import ProductDetails from './pages/ProductDetails.jsx'
// import Cart from './pages/Cart.jsx'
// import Orders from './pages/Orders.jsx'
// import Admin from './pages/Admin.jsx'
// import { useSelector } from 'react-redux'

// import { useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { fetchCurrentUser } from "./store/slices/authSlice";

// export default function App() {
//   const dispatch = useDispatch();

//   useEffect(() => {
//     dispatch(fetchCurrentUser());
//   }, [dispatch]);
  
//   // ... rest of your App.jsx
// }


// function ProtectedRoute({ children, role }) {
//   const user = useSelector(s => s.auth.user)
//   if (!user) return <Navigate to="/login" replace />
//   if (role && user.role !== role) return <Navigate to="/" replace />
//   return children
// }

// export default function App() {
//   const user = useSelector(s => s.auth.user)
//   return (
//     <div className="min-h-screen bg-gray-50 text-gray-900">
//       <nav className="bg-white shadow">
//         <div className="max-w-6xl mx-auto px-4 py-3 flex gap-4 items-center">
//           <Link to="/" className="font-semibold">Shop</Link>
//           <Link to="/products">Products</Link>
//           <Link to="/cart">Cart</Link>
//           {user ? (
//             <>
//               <Link to="/orders">Orders</Link>
//               {user.role === 'admin' && <Link to="/admin">Admin</Link>}
//             </>
//           ) : (
//             <>
//               <Link to="/login">Login</Link>
//               <Link to="/signup">Signup</Link>
//             </>
//           )}
//         </div>
//       </nav>
//       <div className="max-w-6xl mx-auto px-4 py-6">
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<Signup />} />
//           <Route path="/products" element={<Products />} />
//           <Route path="/products/:id" element={<ProductDetails />} />
//           <Route path="/cart" element={<Cart />} />
//           <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
//           <Route path="/admin" element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />
//         </Routes>
//       </div>
//     </div>
//   )
// }


/*import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Products from './pages/Products.jsx'
import ProductDetails from './pages/ProductDetails.jsx'
import Cart from './pages/Cart.jsx'
import Orders from './pages/Orders.jsx'
import Admin from './pages/Admin.jsx'
import { useSelector } from 'react-redux'

function ProtectedRoute({ children, role }) {
  const user = useSelector(s => s.auth.user)
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const user = useSelector(s => s.auth.user)
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-4 items-center">
          <Link to="/" className="font-semibold">Shop</Link>
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart</Link>
          {user ? (
            <>
              <Link to="/orders">Orders</Link>
              {user.role === 'admin' && <Link to="/admin">Admin</Link>}
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </>
          )}
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  )
}

*/

import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { logoutUser, fetchCurrentUser } from "./store/slices/authSlice";

// Pages
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Products from "./pages/Products.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Cart from "./pages/Cart.jsx";
import Orders from "./pages/Orders.jsx";
import Admin from "./pages/Admin.jsx";

function ProtectedRoute({ children, role }) {
  const user = useSelector((s) => s.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const user = useSelector((s) => s.auth.user);
  const cartCount = useSelector((s) => s.cart.items.length);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ Auto fetch user on refresh
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  function handleLogout() {
    dispatch(logoutUser());
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navbar */}
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-4 items-center justify-between">
          {/* Left side links */}
          <div className="flex gap-4 items-center">
            <Link to="/" className="font-semibold">
              Shop
            </Link>
            {user && (
              <>
                <Link to="/products">Products</Link>
                <Link to="/cart">Cart ({cartCount})</Link>
              </>
            )}
          </div>

          {/* Right side auth links */}
          <div className="flex gap-4 items-center">
            {user ? (
              <>
                <span className="text-gray-700">Welcome, {user.name}</span>
                <Link to="/orders">Orders</Link>
                {user.role === "admin" && <Link to="/admin">Admin</Link>}
                <button onClick={handleLogout} className="text-red-600">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/signup">Signup</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Routes */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
