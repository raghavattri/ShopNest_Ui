import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/authSlice';
import { resetFilters, updateList } from '../features/cartSlice';
import './StoreHeader.css';

const StoreHeader = ({ searchTerm, setSearchTerm }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isSeller = useSelector(state => state.auth.isSeller || state.auth.isAdmin);
  const categories = useSelector(state => state.cart.categories);
  const availableColors = useSelector(state => state.cart.availableColors);
  const currentCategory = useSelector(state => state.cart.currentCategory);
  const [currentColor, setCurrentColor] = React.useState('');
  const navigationCategories = categories.filter(category => category.name !== 'home');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setCurrentColor('');

    if (category === 'all') {
      dispatch(resetFilters());
      return;
    }

    dispatch(updateList({ value: category, type: 'category' }));
  };

  const handleColorChange = (event) => {
    const color = event.target.value;
    setCurrentColor(color);

    if (color === 'all') {
      dispatch(resetFilters());
      return;
    }

    dispatch(updateList({ value: color, type: 'color' }));
  };

  const handleReset = () => {
    setCurrentColor('');
    setSearchTerm('');
    dispatch(resetFilters());
  };

  const handleCategoryClick = (category) => {
    setCurrentColor('');
    dispatch(updateList({ value: category, type: 'category' }));
  };

  const selectedCategory = navigationCategories.some(category => category.name === currentCategory)
    ? currentCategory
    : 'all';

  return (
    <header className="store-header">
      <div className="store-header-main">
        <Link to="/" className="store-logo">ShopNest</Link>

        <div className="commerce-search">
          <select
            aria-label="Select category"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="all">All</option>
            {navigationCategories.map(category => (
              <option key={category.name} value={category.name}>{category.name}</option>
            ))}
          </select>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search for products, brands and more"
          />
          <button type="button">Search</button>
        </div>

        <nav className="store-nav">
          {isSeller ? (
            <Link to="/seller">Seller Dashboard</Link>
          ) : (
            <>
              <Link to="/dashboard">Account</Link>
              <Link to="/cart">Cart</Link>
            </>
          )}
          <button type="button" onClick={handleLogout}>Logout</button>
        </nav>
      </div>

      <div className="store-subnav">
        {navigationCategories.slice(0, 6).map(category => (
          <button
            type="button"
            key={category.name}
            className={currentCategory === category.name ? 'active' : ''}
            onClick={() => handleCategoryClick(category.name)}
          >
            {category.name}
          </button>
        ))}
        <select
          aria-label="Filter by color"
          value={currentColor || 'all'}
          onChange={handleColorChange}
        >
          <option value="all">Color</option>
          {availableColors.map(color => (
            <option key={color.name} value={color.name}>{color.name}</option>
          ))}
        </select>
      </div>
    </header>
  );
};

export default StoreHeader;
