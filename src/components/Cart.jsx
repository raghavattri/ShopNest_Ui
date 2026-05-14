import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearCart,
  decreaseCartQuantity,
  increaseCartQuantity,
  removeFromCart
} from '../features/cartSlice';
import './Cart.css';

const Cart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.cartItems);

  const subtotal = cartItems.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);
  const deliveryFee = subtotal > 0 ? 99 : 0;
  const total = subtotal + deliveryFee;

  if (cartItems.length === 0) {
    return (
      <main className="cart-page">
        <section className="empty-cart">
          <h1>Your cart is empty</h1>
          <p>Add products from the catalog and they will appear here.</p>
          <Link to="/">Continue shopping</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-header">
        <div>
          <p className="cart-eyebrow">Shopping cart</p>
          <h1>Your bag</h1>
          <p>Review your selected products before checkout.</p>
        </div>
        <Link to="/" className="continue-link">Continue shopping</Link>
      </div>

      <section className="cart-layout">
        <div className="cart-items">
          {cartItems.map(item => (
            <article key={item.cartItemId || `${item.product._id}-${item.selectedColor}-${item.selectedSize}`} className="cart-item">
              <img src={item.product.imageUrl} alt={item.product.name} />
              <div className="cart-item-details">
                <span>{item.product.category}</span>
                <h2>{item.product.name}</h2>
                {(item.selectedColor || item.selectedSize) && (
                  <small>
                    {item.selectedColor && `Color: ${item.selectedColor}`}
                    {item.selectedColor && item.selectedSize && ' • '}
                    {item.selectedSize && `Size: ${item.selectedSize}`}
                  </small>
                )}
                <p>Rs. {item.product.price}</p>
                <button
                  type="button"
                  className="remove-cart-button"
                  onClick={() => dispatch(removeFromCart(item.cartItemId || item.product._id))}
                >
                  Remove
                </button>
              </div>
              <div className="quantity-control">
                <button
                  type="button"
                  onClick={() => dispatch(decreaseCartQuantity(item.cartItemId || item.product._id))}
                >
                  -
                </button>
                <strong>{item.quantity}</strong>
                <button
                  type="button"
                  onClick={() => dispatch(increaseCartQuantity(item.cartItemId || item.product._id))}
                  disabled={item.quantity >= item.product.stock}
                >
                  +
                </button>
              </div>
              <p className="line-total">Rs. {item.product.price * item.quantity}</p>
            </article>
          ))}
        </div>

        <aside className="cart-summary">
          <h2>Order summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>Rs. {subtotal}</strong>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <strong>Rs. {deliveryFee}</strong>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <strong>Rs. {total}</strong>
          </div>
          <Link to="/checkout" className="checkout-button">Checkout</Link>
          <button type="button" className="clear-cart-button" onClick={() => dispatch(clearCart())}>
            Clear cart
          </button>
        </aside>
      </section>
    </main>
  );
};

export default Cart;
