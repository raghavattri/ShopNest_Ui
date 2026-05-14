import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../features/cartSlice';
import { createOrder } from '../features/orderSlice';
import './Checkout.css';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(state => state.cart.cartItems);
  const loading = useSelector(state => state.orders.loading);
  const orderError = useSelector(state => state.orders.error);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    address: ''
  });
  const [formError, setFormError] = useState('');
  const subtotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 99 : 0;
  const total = subtotal + deliveryFee;

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setShippingAddress(prevState => ({ ...prevState, [name]: value }));
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
      setFormError('Please fill all delivery details');
      return;
    }

    setFormError('');

    const payload = {
      shippingAddress,
      items: cartItems.map(item => ({
        product: item.product._id,
        name: item.product.name,
        imageUrl: item.product.imageUrl,
        price: item.product.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize
      })),
      subtotal,
      deliveryFee,
      total
    };

    const action = await dispatch(createOrder(payload));

    if (!action.error) {
      dispatch(clearCart());
      navigate('/dashboard?tab=orders');
    }
  };

  if (!cartItems.length) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <h1>Your cart is empty</h1>
          <p>Add an item before checkout.</p>
          <Link to="/">Continue shopping</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <Link to="/" className="checkout-logo">ShopNest</Link>
        <Link to="/cart">Back to cart</Link>
      </header>

      <section className="checkout-layout">
        <form className="checkout-form" onSubmit={handlePlaceOrder}>
          <p className="checkout-eyebrow">Checkout</p>
          <h1>Delivery details</h1>
          {(formError || orderError) && <div className="checkout-error">{formError || orderError}</div>}
          <label>
            Full name
            <input name="fullName" value={shippingAddress.fullName} onChange={handleInputChange} placeholder="Enter full name" />
          </label>
          <label>
            Phone number
            <input name="phone" value={shippingAddress.phone} onChange={handleInputChange} placeholder="Enter phone number" />
          </label>
          <label>
            Address
            <textarea name="address" value={shippingAddress.address} onChange={handleInputChange} placeholder="House number, street, city, state" />
          </label>
          <button type="submit" disabled={loading}>{loading ? 'Placing order...' : 'Place order'}</button>
        </form>

        <aside className="checkout-summary">
          <h2>Order summary</h2>
          {cartItems.map(item => (
            <div key={item.cartItemId || `${item.product._id}-${item.selectedColor}-${item.selectedSize}`} className="checkout-item">
              <img src={item.product.imageUrl} alt={item.product.name} />
              <div>
                <strong>{item.product.name}</strong>
                <span>Qty {item.quantity}</span>
                {(item.selectedColor || item.selectedSize) && (
                  <small>{[item.selectedColor, item.selectedSize].filter(Boolean).join(' / ')}</small>
                )}
              </div>
            </div>
          ))}
          <div className="checkout-total-row">
            <span>Subtotal</span>
            <strong>Rs. {subtotal}</strong>
          </div>
          <div className="checkout-total-row">
            <span>Delivery</span>
            <strong>Rs. {deliveryFee}</strong>
          </div>
          <div className="checkout-grand-total">
            <span>Total</span>
            <strong>Rs. {total}</strong>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default Checkout;
