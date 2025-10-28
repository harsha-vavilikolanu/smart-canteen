import { useState, useEffect } from 'react';
import './App.css'; // We will create this file next

function App() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('menu'); // 'menu' or 'kitchen'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Fetch menu on initial component load
  useEffect(() => {
    fetchMenu();
  }, []);

  // Fetch menu from our backend API
  const fetchMenu = async () => {
    try {
      setLoading(true);
      // We can use a relative path because of the proxy we set in vite.config.js
      const response = await fetch('/api/menu');
      const data = await response.json();
      setMenu(data);
    } catch (error) {
      console.error('Failed to fetch menu:', error);
      setMessage('Error: Could not load menu.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all orders (for kitchen view)
  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  // Add an item from the menu to the cart
  const addToCart = (item) => {
    setCart((prevCart) => {
      // Check if item is already in cart
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        // If yes, increase quantity
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        // If no, add to cart with quantity 1
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  // Calculate total price of the cart
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Submit the order to the backend
  const placeOrder = async () => {
    if (cart.length === 0) return;

    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart,
          total: cartTotal,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Order #${data.order.id} placed successfully!`);
        setCart([]); // Clear the cart
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Failed to place order:', error);
      setMessage('Error: Could not connect to server.');
    }
  };

  // Simple component to render the menu
  const MenuDisplay = () => (
    <div>
      <h2>Menu</h2>
      {loading && <p>Loading menu...</p>}
      <div className="item-list">
        {menu.map((item) => (
          <div key={item.id} className="item-card">
            <h3>{item.name}</h3>
            <p>(${item.price.toFixed(2)})</p>
            <p><em>{item.category}</em></p>
            <button onClick={() => addToCart(item)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );

  // Simple component to render the cart
  const CartDisplay = () => (
    <div className="cart-section">
      <h2>Your Order</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul>
            {cart.map((item) => (
              <li key={item.id}>
                {item.name} (x{item.quantity}) - $
                {(item.price * item.quantity).toFixed(2)}
              </li>
            ))}
          </ul>
          <h3>Total: ${cartTotal.toFixed(2)}</h3>
          <button onClick={placeOrder} disabled={cart.length === 0}>
            Place Order
          </button>
        </>
      )}
    </div>
  );

  // Simple component to show the kitchen staff the orders
  const KitchenDisplay = () => {
    // Fetch orders when switching to this view
    useEffect(() => {
      fetchOrders();

      // Optional: auto-refresh orders every 10 seconds
      const interval = setInterval(fetchOrders, 10000);
      return () => clearInterval(interval); // Cleanup interval on unmount
    }, []);

    return (
      <div className="kitchen-view">
        <h2>Kitchen Orders</h2>
        <button onClick={fetchOrders}>Refresh Orders</button>
        <div className="order-list">
          {orders.length === 0 && <p>No orders yet.</p>}
          {orders.map((order) => (
            <div key={order.id} className="item-card order-card">
              <h3>Order #{order.id}</h3>
              <p>Status: {order.status}</p>
              <ul>
                {order.items.map((item) => (
                  <li key={item.id}>{item.name} (x{item.quantity})</li>
                ))}
              </ul>
              <h4>Total: ${order.total.toFixed(2)}</h4>
              <p><small>{new Date(order.timestamp).toLocaleTimeString()}</small></p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <header>
        <h1>Smart Canteen</h1>
        <nav>
          <button onClick={() => setView('menu')}>Order Menu</button>
          <button onClick={() => setView('kitchen')}>Kitchen View</button>
        </nav>
      </header>

      {message && <p className="message">{message}</p>}

      {view === 'menu' ? (
        <main className="order-view">
          <MenuDisplay />
          <CartDisplay />
        </main>
      ) : (
        <main>
          <KitchenDisplay />
        </main>
      )}
    </div>
  );
}

export default App;