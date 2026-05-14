import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/authSlice';
import { getMyOrders } from '../features/orderSlice';
import StoreFooter from './StoreFooter';
import './UserDashboard.css';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(state => state.auth.user);
  const cartItems = useSelector(state => state.cart.cartItems);
  const orders = useSelector(state => state.orders.items);
  const ordersLoading = useSelector(state => state.orders.loading);
  const [showOrders, setShowOrders] = useState(new URLSearchParams(location.search).get('tab') === 'orders');

  const cartSummary = useMemo(() => {
    const quantity = cartItems.reduce((total, item) => total + item.quantity, 0);
    const value = cartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    return { quantity, value };
  }, [cartItems]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleShowOrders = () => {
    setShowOrders(true);
    dispatch(getMyOrders());
  };

  useEffect(() => {
    if (showOrders) {
      dispatch(getMyOrders());
    }
  }, [dispatch, showOrders]);

  return (
    <div className="user-dashboard-page">
      <header className="account-header">
        <Link to="/" className="account-logo">ShopNest</Link>
        <nav>
          <Link to="/">Products</Link>
          <Link to="/cart">Cart</Link>
          <button type="button" onClick={handleLogout}>Logout</button>
        </nav>
      </header>

      <main className="user-dashboard">
        <section className="user-hero">
          <div>
            <p className="user-eyebrow">My account</p>
            <h1>Account dashboard</h1>
            <p>View your profile, cart summary, and order history.</p>
          </div>
        </section>

        <section className="dashboard-layout">
          <div className="profile-card">
            <div className="profile-avatar">
              {(user?.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <span>Profile</span>
              <h2>{user?.username || 'User'}</h2>
              <p>{user?.email || 'No email available'}</p>
            </div>
          </div>

          <div className="dashboard-panel cart-overview">
            <div>
              <span>Cart overview</span>
              <h2>Rs. {cartSummary.value}</h2>
              <p>{cartSummary.quantity} item{cartSummary.quantity === 1 ? '' : 's'} currently saved.</p>
            </div>
            <Link to="/cart">Review cart</Link>
          </div>

          <div className="dashboard-panel">
            <div className="dashboard-panel-heading">
              <div>
                <p>Shopping</p>
                <h2>Quick actions</h2>
              </div>
            </div>
            <div className="quick-actions">
              <Link to="/">Browse products</Link>
              <Link to="/cart">View cart</Link>
              <button type="button" onClick={handleShowOrders}>Order history</button>
            </div>
          </div>

          <div className="dashboard-panel orders-panel">
            <div className="dashboard-panel-heading">
              <div>
                <p>Orders</p>
                <h2>Recent activity</h2>
              </div>
            </div>
            {!showOrders ? (
              <div className="empty-dashboard-state">
                <h3>Order history is hidden</h3>
                <p>Click the order history button to view your placed orders.</p>
              </div>
            ) : ordersLoading ? (
              <div className="empty-dashboard-state">
                <h3>Loading orders...</h3>
                <p>Please wait while we fetch your order history.</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="empty-dashboard-state">
                <h3>No orders yet</h3>
                <p>Place an order from checkout and it will appear here.</p>
              </div>
            ) : (
              <div className="order-history-list">
                {orders.map(order => (
                  <article key={order._id} className="order-history-card">
                    <div className="order-history-top">
                      <div>
                        <span>Order</span>
                        <h3>#{order._id.slice(-6).toUpperCase()}</h3>
                      </div>
                      <strong>{order.status}</strong>
                    </div>
                    <p>{new Date(order.createdAt).toLocaleDateString()} • Rs. {order.total}</p>
                    <div className="order-history-items">
                      {order.items.map(item => (
                        <div key={`${order._id}-${item.product}-${item.selectedColor}-${item.selectedSize}`} className="order-history-item">
                          <img src={item.imageUrl} alt={item.name} />
                          <div>
                            <strong>{item.name}</strong>
                            <span>Qty {item.quantity}</span>
                            {(item.selectedColor || item.selectedSize) && (
                              <small>{[item.selectedColor, item.selectedSize].filter(Boolean).join(' / ')}</small>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <StoreFooter />
    </div>
  );
};

export default UserDashboard;
