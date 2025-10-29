import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import bgImg from './img1.jpg' // <-- image placed directly in src folder
import './App.css'

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderStatus, setOrderStatus] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- Login Logic ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'user' && password === '1234') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setCart([]);
    setOrders([]);
  };

  // --- Manage background class & inline style is optional fallback ---
  useEffect(() => {
    // Nothing needed for body classes when using inline background + has-bg class.
    return () => {}; // no cleanup required here
  }, [isLoggedIn]);

  // --- Data Fetching ---
  useEffect(() => {
    if (!isLoggedIn) return; // Fetch only when logged in
    setLoadingMenu(true);
    fetch('http://localhost:5000/api/menu')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok for menu');
        return response.json();
      })
      .then(data => {
        setMenuItems(data);
        setError(null);
      })
      .catch(fetchError => {
        console.error("Menu fetch error:", fetchError);
        setError("Could not load menu");
      })
      .finally(() => setLoadingMenu(false));
  }, [isLoggedIn]);

  const fetchOrders = () => {
    if (!isLoggedIn) return;
    setLoadingOrders(true);
    fetch('http://localhost:5000/api/orders')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok for orders');
        return response.json();
      })
      .then(data => {
        setOrders(data);
        setError(null);
      })
      .catch(fetchError => {
        console.error("Orders fetch error:", fetchError);
        setError("Could not load orders");
      })
      .finally(() => setLoadingOrders(false));
  };

  useEffect(() => {
    if (isLoggedIn) fetchOrders();
  }, [isLoggedIn]);

  // --- Cart and Order Logic ---
  const addToCart = (itemToAdd) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem._id === itemToAdd._id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem._id === itemToAdd._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...itemToAdd, quantity: 1 }];
      }
    });
    setOrderStatus('');
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const placeOrder = () => {
    if (cart.length === 0) return;
    setOrderStatus('Placing order...');

    const orderData = {
      items: cart.map(item => ({
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalAmount: cartTotal
    };

    fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(errData => {
           throw new Error(errData.message || 'Failed to place order');
        }).catch(() => {
             throw new Error(`HTTP error! status: ${response.status}`);
        });
      }
      return response.json();
    })
    .then(data => {
      setOrderStatus(`Order placed successfully! Order ID: ${data.orderId ? data.orderId.slice(-6) : '—'}`);
      setCart([]);
      fetchOrders();
    })
    .catch(err => {
      console.error('Order error:', err);
      setOrderStatus(`Error placing order: ${err.message}`);
    });
  };

  // Inline background style when logged in (image from src/)
  const appBgStyle = isLoggedIn ? {
    backgroundImage: `url(${bgImg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed', // remove for better mobile perf if needed
  } : undefined;

  // --- Login Page ---
  if (!isLoggedIn) {
    return (
      <div className="login-page">
        <h1>Smart Canteen Login</h1>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        {loginError && <p className="message error">{loginError}</p>}
        <p className="hint">Hint: Username = user | Password = 1234</p>
      </div>
    );
  }

  // --- Main App (after login) ---
  return (
    <div
      className={`App ${isLoggedIn ? 'has-bg' : ''}`}
      style={appBgStyle}
    >
      <header>
        <h1>Smart Canteen</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      {error && <p className="message error">{error}</p>}

      <div className="order-view">
        <section className="menu-section">
          <h2>Menu</h2>
          {loadingMenu && <p>Loading menu...</p>}
          {!loadingMenu && menuItems.length === 0 && !error && <p>No menu items available.</p>}
          <div className="item-list">
            {menuItems.map(item => (
              <div key={item._id} className="item-card">
                <h3>{item.name}</h3>
                <p className="price">₹{item.price.toFixed(2)}</p>
                {item.description && <p><em>{item.description}</em></p>}
                <p><small>Category: {item.category}</small></p>
                <button onClick={() => addToCart(item)}>Add to Cart</button>
              </div>
            ))}
          </div>
        </section>

        <aside className="cart-section">
          <h2>Your Order</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              <ul>
                {cart.map(item => (
                  <li key={item._id}>
                    <span>{item.name} x {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <h3>Total: ₹{cartTotal.toFixed(2)}</h3>
              <button
                onClick={placeOrder}
                disabled={cart.length === 0 || orderStatus === 'Placing order...'}
              >
                Place Order
              </button>
            </>
          )}
          {orderStatus && <p className="message">{orderStatus}</p>}
        </aside>
      </div>

      <section className="orders-history-section">
        <h2>Order History</h2>
        {loadingOrders && <p>Loading orders...</p>}
        {!loadingOrders && orders.length === 0 && !error && <p>No previous orders found.</p>}
        <div className="order-list">
          {orders.map(order => (
            <div key={order._id} className="item-card order-card">
              <h4>Order ID: ...{order._id.slice(-6)}</h4>
              <p className="price">Total: ₹{order.totalAmount.toFixed(2)}</p>
              <p>Status: {order.status || 'Pending'}</p>
              <small>Placed: {new Date(order.createdAt).toLocaleString()}</small>
              <ul>
                {order.items.map((item, index) => (
                  <li key={index}><small>{item.name} x {item.quantity}</small></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default App
