import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './ProductList.css';
import { getData } from "../features/cartSlice"
import { useNavigate } from 'react-router-dom';

function ProductList({ searchTerm = '' }) {
    const cartItems = useSelector(state => state.cart.items);
    const showItems = useSelector(state => state.cart.showItems);
    const reduxCurrentCategory = useSelector(state => state.cart.currentCategory);
    
    const [displayItems, setDisplayItems] = useState([]);
    const [visibleLimit, setVisibleLimit] = useState(8);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(()=>{
        dispatch(getData());
    }, [])
    
    useEffect(() => {
        const sourceItems = reduxCurrentCategory === 'all' ? cartItems : showItems;
        const nextItems = searchTerm
            ? sourceItems.filter(product =>
                product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            : sourceItems;

        setDisplayItems(nextItems);
        setVisibleLimit(8);
    }, [cartItems, showItems, reduxCurrentCategory, searchTerm])

    return (
        <div className="product-list-container">
            <div className="catalog-header">
                <div>
                    <p className="catalog-eyebrow">ShopNest catalog</p>
                    <h1>Featured products</h1>
                    <p className="catalog-subtitle">
                        Browse curated products across fashion, tech, home, and everyday essentials.
                    </p>
                </div>
            </div>

            {displayItems.length === 0 ? (
                <div className="empty-products">
                    <h3>No products found</h3>
                    <p>Try a different search term or reset your filters.</p>
                </div>
            ) : (
                <div className="product-grid">
                    {displayItems.slice(0, visibleLimit).map(product => {
                        const variants = product.variants || [];
                        const uniqueColors = [...new Set(variants.map(item => item.color).filter(Boolean))];

                        return (
                            <article key={product._id} className="product-card">
                                <div className="product-image-wrap">
                                    <img src={product.imageUrl} alt={product.name} className="product-image" />
                                    <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                                        {product.stock > 0 ? 'In stock' : 'Out of stock'}
                                    </span>
                                </div>
                                <div className="product-details">
                                    <div className="product-meta-row">
                                        <span className="category-badge">{product.category}</span>
                                    </div>
                                    <h3 className="product-title">{product.name}</h3>
                                    <p className="product-price">Rs. {product.price}</p>
                                    <div className="variant-row">
                                        {uniqueColors.map(color => (
                                            <span key={`${product._id}-${color}`} className="variant-chip">{color}</span>
                                        ))}
                                    </div>
                                    <div className="product-footer">
                                        <button
                                            type="button"
                                            className="view-product-button"
                                            onClick={() => navigate(`/products/${product._id}`)}
                                        >
                                            View details
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                    {visibleLimit < displayItems.length && (
                        <div className="load-more-wrap">
                            <button
                                type="button"
                                className="load-more-button"
                                onClick={() => setVisibleLimit(prevLimit => prevLimit + 8)}
                            >
                                Load more products
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ProductList;
