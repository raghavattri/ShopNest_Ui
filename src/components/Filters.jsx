import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { resetFilters, updateList } from '../features/cartSlice';

import "./Filters.css";

const Filters = () => {
    const categories = useSelector(state => state.cart.categories);
    const availableColors = useSelector(state => state.cart.availableColors);
    const reduxCurrentCategory = useSelector(state => state.cart.currentCategory);
    const [currentColor, setCurrentColor] = useState('');
    const dispatch = useDispatch();
    
    const handleCategory = (category) => {
        dispatch(updateList({value: category, type: 'category' }));
    };
    const handleColor = (color) => {
        setCurrentColor(color);
        dispatch(updateList({value: color, type:'color'}));
    };

    const handleResetFilters = ()=>{
        setCurrentColor('');
        dispatch(resetFilters());
    }

    return (
        <div className='filters-container'>
            <div className="filter-section">
                <h2>Category</h2>
                <ul className="filter-list">
                    {categories.map(category => (
                        <li key={category.name}>
                            <button
                                type="button"
                                onClick={() => handleCategory(category.name)}
                                className={`filter-option ${reduxCurrentCategory === category.name ? 'active' : ''}`}
                            >
                                <span>{category.name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="filter-section">
                <h2>Color</h2>
                <ul className="filter-list">
                    {availableColors.map(color => (
                        <li key={color.name}>
                            <button
                                type="button"
                                onClick={() => handleColor(color.name)}
                                className={`filter-option ${currentColor === color.name ? 'active' : ''}`}
                            >
                                <span className="color-label">
                                    <i style={{ backgroundColor: color.name }} />
                                    {color.name}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="filter-actions">
                <button className='reset-filters' onClick={handleResetFilters}>Reset filters</button>
            </div>

        </div>
    );
};

export default Filters;
