import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, getProductById } from '../features/cartSlice';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const productFromList = useSelector(state =>
    state.cart.items.find(item => item._id === id)
  );
  const selectedProduct = useSelector(state => state.cart.selectedProduct);
  const loading = useSelector(state => state.cart.loading);
  const error = useSelector(state => state.cart.selectedProductError);
  const isSeller = useSelector(state => state.auth.isSeller || state.auth.isAdmin);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectionError, setSelectionError] = useState('');
  const [addedFeedback, setAddedFeedback] = useState(false);

  const product = productFromList || selectedProduct;

  const colors = useMemo(() => {
    return [...new Set((product?.variants || []).map(item => item.color).filter(Boolean))];
  }, [product]);

  const sizes = useMemo(() => {
    return [...new Set((product?.variants || []).map(item => item.size).filter(Boolean))];
  }, [product]);

  useEffect(() => {
    if (!productFromList) {
      dispatch(getProductById(id));
    }
  }, [dispatch, id, productFromList]);

  useEffect(() => {
    if (colors.length && !selectedColor) {
      setSelectedColor(colors[0]);
    }

    if (sizes.length && !selectedSize) {
      setSelectedSize(sizes[0]);
    }
  }, [colors, selectedColor, selectedSize, sizes]);

  const handleAddToCart = () => {
    if (!selectedSize && sizes.length) {
      setSelectionError('Please select a size');
      return;
    }

    setSelectionError('');
    dispatch(addToCart({ product, quantity, selectedColor, selectedSize }));
    setAddedFeedback(true);
    window.setTimeout(() => setAddedFeedback(false), 1800);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  if (loading && !product) {
    return (
      <main className="product-detail-page">
        <div className="product-detail-state">Loading product details...</div>
      </main>
    );
  }

  if (error && !product) {
    return (
      <main className="product-detail-page">
        <div className="product-detail-state">
          <h2>Product not found</h2>
          <p>{error}</p>
          <Link to="/">Back to products</Link>
        </div>
      </main>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <main className="product-detail-page">
      <header className="detail-topbar">
        <Link to="/" className="detail-logo">ShopNest</Link>
        <div>
          <Link to="/">Products</Link>
          {isSeller ? <Link to="/seller">Seller</Link> : <Link to="/cart">Cart</Link>}
        </div>
      </header>

      <nav className="detail-breadcrumb">
        <Link to="/">ShopNest</Link>
        <span>/</span>
        <Link to="/">{product.category}</Link>
        <span>/</span>
        <strong>{product.name}</strong>
      </nav>

      <section className="product-detail-shell">
        <div className="product-detail-media">
          <img src={product.imageUrl} alt={product.name} />
          <span className={`detail-stock-badge ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
            {product.stock > 0 ? 'Available now' : 'Out of stock'}
          </span>
        </div>

        <div className="product-detail-content">
          <div className="detail-kicker">
            <span className="detail-category">{product.category}</span>
            <span className="detail-rating">4.6 / 5 rating</span>
          </div>
          <h1>{product.name}</h1>
          <p className="detail-description">
            A carefully selected ShopNest product with clear availability, variant options, and a polished buying experience.
          </p>

          <div className="detail-info-grid">
            <div>
              <span>Stock</span>
              <strong>{product.stock} units</strong>
            </div>
            <div>
              <span>Category</span>
              <strong>{product.category}</strong>
            </div>
          </div>

          <div className="detail-section">
            <h2>Available colors</h2>
            <div className="detail-chip-row">
              {colors.length > 0 ? colors.map(color => (
                <button
                  type="button"
                  key={color}
                  className={`detail-chip ${selectedColor === color ? 'selected' : ''}`}
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </button>
              )) : <span className="detail-muted">No colors listed</span>}
            </div>
          </div>

          <div className="detail-section">
            <h2>Available sizes</h2>
            <div className="detail-chip-row">
              {sizes.length > 0 ? sizes.map(size => (
                <button
                  type="button"
                  key={size}
                  className={`detail-chip ${selectedSize === size ? 'selected' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              )) : <span className="detail-muted">No sizes listed</span>}
            </div>
          </div>

          {!isSeller && (
            <div className="detail-section">
              <h2>Quantity</h2>
              <div className="detail-quantity">
                <button type="button" onClick={() => setQuantity(prev => Math.max(1, prev - 1))}>-</button>
                <strong>{quantity}</strong>
                <button type="button" onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}>+</button>
              </div>
              {selectionError && <p className="selection-error">{selectionError}</p>}
            </div>
          )}

          <div className="detail-section">
            <h2>Variants</h2>
            <div className="variant-table">
              {(product.variants || []).map((variant, index) => (
                <div key={`${variant.color}-${variant.size}-${index}`} className="variant-table-row">
                  <span>{variant.color || 'Default color'}</span>
                  <strong>{variant.size || 'Default size'}</strong>
                </div>
              ))}
            </div>
          </div>

          <aside className="detail-buy-box">
            <div>
              <p className="detail-price">Rs. {product.price}</p>
              <p className="tax-copy">Inclusive of all taxes</p>
            </div>
            <div className="delivery-card">
              <strong>Fast delivery available</strong>
              <span>Free returns within 7 days</span>
            </div>
          </aside>

          {isSeller ? (
            <Link to="/seller" className="detail-secondary-link">Manage inventory</Link>
          ) : (
            <>
              <button
                type="button"
                className={`detail-primary-button ${addedFeedback ? 'added' : ''}`}
                disabled={product.stock <= 0}
                onClick={handleAddToCart}
              >
                {addedFeedback ? 'Added to cart' : product.stock > 0 ? 'Add to cart' : 'Out of stock'}
              </button>
              <button type="button" className="detail-buy-button" disabled={product.stock <= 0} onClick={handleBuyNow}>
                Buy now
              </button>
              <Link to="/cart" className="detail-secondary-link">View cart</Link>
            </>
          )}

          <div className="trust-list">
            <span>Secure checkout</span>
            <span>Quality checked</span>
            <span>Easy replacement</span>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProductDetails;
