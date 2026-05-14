import React from 'react';
import './StoreFooter.css';

const StoreFooter = () => {
  return (
    <footer className="store-footer">
      <div>
        <h2>ShopNest</h2>
        <p>Curated everyday essentials with simple product discovery and a smooth shopping flow.</p>
      </div>
      <div className="footer-links">
        <span>Secure login</span>
        <span>Product filters</span>
        <span>Cart persistence</span>
      </div>
    </footer>
  );
};

export default StoreFooter;
