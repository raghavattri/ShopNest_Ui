import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { addProduct, deleteProduct, getData, updateProduct, uploadProductImage } from '../features/cartSlice';
import { logout } from '../features/authSlice';
import { getSellerOrders, updateOrderStatus } from '../features/orderSlice';
import './Admin.css';

const emptyProduct = {
  name: '',
  category: '',
  price: '',
  stock: '',
  imageUrl: '',
  color: '',
  size: ''
};

const orderStatuses = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const products = useSelector(state => state.cart.items);
  const loading = useSelector(state => state.cart.loading);
  const orders = useSelector(state => state.orders.items);
  const orderLoading = useSelector(state => state.orders.loading);
  const orderError = useSelector(state => state.orders.error);
  const loggedIn = useSelector(state => state.auth.loggedIn);
  const [formData, setFormData] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    dispatch(getData());
    dispatch(getSellerOrders());
  }, [dispatch]);

  useEffect(() => {
    if (!loggedIn) {
      navigate('/login');
    }
  }, [loggedIn, navigate]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.toLowerCase();

    if (!query) return products;

    return products.filter(product =>
      product.name?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query)
    );
  }, [products, searchTerm]);

  const stats = useMemo(() => {
    const stock = products.reduce((total, product) => total + Number(product.stock || 0), 0);
    const inventoryValue = products.reduce((total, product) => {
      return total + Number(product.price || 0) * Number(product.stock || 0);
    }, 0);
    const categories = new Set(products.map(product => product.category).filter(Boolean));

    return {
      products: products.length,
      stock,
      categories: categories.size,
      inventoryValue,
      orders: orders.length,
      pendingOrders: orders.filter(order => !['Delivered', 'Cancelled'].includes(order.status)).length
    };
  }, [orders, products]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage('');
    setImageUploading(true);

    const action = await dispatch(uploadProductImage(file));
    setImageUploading(false);

    if (action.error) {
      setMessage(action.payload?.message || 'Image upload failed');
      return;
    }

    setFormData(prevState => ({ ...prevState, imageUrl: action.payload.imageUrl }));
    setMessage('Image uploaded successfully');
  };

  const buildPayload = () => ({
    name: formData.name.trim(),
    category: formData.category.trim().toLowerCase(),
    price: Number(formData.price),
    stock: Number(formData.stock),
    imageUrl: formData.imageUrl.trim(),
    variants: [
      {
        color: formData.color.trim().toLowerCase(),
        size: formData.size.trim()
      }
    ]
  });

  const resetForm = () => {
    setEditingId(null);
    setFormData(emptyProduct);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    const payload = buildPayload();
    const action = editingId
      ? await dispatch(updateProduct({ id: editingId, finalData: payload }))
      : await dispatch(addProduct(payload));

    if (action.error) {
      setMessage(action.payload?.message || 'Something went wrong');
      return;
    }

    setMessage(editingId ? 'Product updated successfully' : 'Product added successfully');
    resetForm();
    dispatch(getData());
  };

  const handleEdit = (product) => {
    const firstVariant = product.variants?.[0] || {};
    setEditingId(product._id);
    setFormData({
      name: product.name || '',
      category: product.category || '',
      price: product.price || '',
      stock: product.stock || '',
      imageUrl: product.imageUrl || '',
      color: firstVariant.color || '',
      size: firstVariant.size || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (productId) => {
    const action = await dispatch(deleteProduct(productId));

    if (action.error) {
      setMessage(action.payload?.message || 'Could not delete product');
      return;
    }

    setMessage('Product deleted successfully');
    dispatch(getData());
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleStatusChange = async (orderId, status) => {
    const action = await dispatch(updateOrderStatus({ orderId, status }));

    if (action.error) {
      setMessage(action.payload?.message || 'Could not update order status');
      return;
    }

    setMessage(`Order marked as ${status}`);
    dispatch(getData());
  };

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-logo">ShopNest</Link>
        <nav>
          <Link to="/">Storefront</Link>
          <button type="button" onClick={handleLogout}>Logout</button>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">Inventory workspace</p>
            <h1>Seller Dashboard</h1>
            <p>Manage your products, pricing, stock, and catalog visibility.</p>
          </div>
        </header>

        <section className="admin-stats">
          <div>
            <span>Products</span>
            <strong>{stats.products}</strong>
          </div>
          <div>
            <span>Total stock</span>
            <strong>{stats.stock}</strong>
          </div>
          <div>
            <span>Categories</span>
            <strong>{stats.categories}</strong>
          </div>
          <div>
            <span>Inventory value</span>
            <strong>Rs. {stats.inventoryValue}</strong>
          </div>
          <div>
            <span>Active orders</span>
            <strong>{stats.pendingOrders}</strong>
          </div>
        </section>

        <section className="seller-orders-panel">
          <div className="admin-panel-heading">
            <div>
              <p>Fulfillment</p>
              <h2>Order management</h2>
            </div>
            {orderLoading && <span className="seller-order-loading">Loading orders...</span>}
          </div>

          {orderError && <div className="admin-message">{orderError}</div>}

          <div className="seller-order-list">
            {orders.length === 0 ? (
              <div className="seller-empty-orders">
                <h3>No orders yet</h3>
                <p>Placed buyer orders will appear here for fulfillment.</p>
              </div>
            ) : (
              orders.map(order => (
                <article key={order._id} className="seller-order-card">
                  <div className="seller-order-top">
                    <div>
                      <span>Order #{order._id.slice(-6).toUpperCase()}</span>
                      <h3>{order.user?.username || order.shippingAddress?.fullName || 'Buyer'}</h3>
                      <p>{order.user?.email || order.shippingAddress?.phone}</p>
                    </div>
                    <div className={`seller-status-pill ${order.status.toLowerCase()}`}>
                      {order.status}
                    </div>
                  </div>

                  <div className="seller-order-items">
                    {order.items.map(item => (
                      <div key={`${order._id}-${item.product}-${item.selectedColor}-${item.selectedSize}`} className="seller-order-item">
                        <img src={item.imageUrl} alt={item.name} />
                        <div>
                          <strong>{item.name}</strong>
                          <span>
                            Qty {item.quantity}
                            {item.selectedSize ? ` - Size ${item.selectedSize}` : ''}
                            {item.selectedColor ? ` - ${item.selectedColor}` : ''}
                          </span>
                        </div>
                        <p>Rs. {item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>

                  <div className="seller-order-footer">
                    <div>
                      <span>Ship to</span>
                      <p>{order.shippingAddress?.address}</p>
                    </div>
                    <div>
                      <span>Total</span>
                      <strong>Rs. {order.total}</strong>
                    </div>
                    <label>
                      Status
                      <select
                        value={order.status}
                        onChange={(event) => handleStatusChange(order._id, event.target.value)}
                      >
                        {orderStatuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="admin-layout">
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-panel-heading">
              <div>
                <p>{editingId ? 'Edit product' : 'Create product'}</p>
                <h2>{editingId ? 'Update catalog item' : 'Add new catalog item'}</h2>
              </div>
              {editingId && (
                <button type="button" className="ghost-button" onClick={resetForm}>Cancel</button>
              )}
            </div>

            {message && <div className="admin-message">{message}</div>}

            <label>
              Product name
              <input name="name" value={formData.name} onChange={handleInputChange} required />
            </label>
            <label>
              Category
              <input name="category" value={formData.category} onChange={handleInputChange} required />
            </label>
            <div className="admin-form-grid">
              <label>
                Price
                <input name="price" type="number" min="0" value={formData.price} onChange={handleInputChange} required />
              </label>
              <label>
                Stock
                <input name="stock" type="number" min="0" value={formData.stock} onChange={handleInputChange} required />
              </label>
            </div>
            <label>
              Image URL
              <input name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} required />
            </label>
            <label>
              Upload product image
              <input type="file" accept="image/*" onChange={handleImageUpload} />
            </label>
            {formData.imageUrl && (
              <div className="admin-image-preview">
                <img src={formData.imageUrl} alt="Product preview" />
                <span>{imageUploading ? 'Uploading image...' : 'Image ready'}</span>
              </div>
            )}
            <div className="admin-form-grid">
              <label>
                Color
                <input name="color" value={formData.color} onChange={handleInputChange} required />
              </label>
              <label>
                Size
                <input name="size" value={formData.size} onChange={handleInputChange} required />
              </label>
            </div>
            <button type="submit" className="primary-admin-button" disabled={loading || imageUploading}>
              {editingId ? 'Update product' : 'Add product'}
            </button>
          </form>

          <section className="admin-products-panel">
            <div className="admin-panel-heading">
              <div>
                <p>Catalog</p>
                <h2>Products</h2>
              </div>
              <input
                className="admin-search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search product or category"
              />
            </div>

            <div className="admin-product-list">
              {filteredProducts.map(product => (
                <article key={product._id} className="admin-product-row">
                  <img src={product.imageUrl} alt={product.name} />
                  <div>
                    <span>{product.category}</span>
                    <h3>{product.name}</h3>
                    <p>Rs. {product.price} - Stock {product.stock}</p>
                  </div>
                  <div className="admin-row-actions">
                    <button type="button" onClick={() => handleEdit(product)}>Edit</button>
                    <button type="button" className="danger-button" onClick={() => handleDelete(product._id)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
