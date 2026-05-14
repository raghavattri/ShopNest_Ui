import React, { useState } from 'react'
import ProductList from './ProductList'
import StoreFooter from './StoreFooter'
import StoreHeader from './StoreHeader'
import './Home.css'

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="store-page">
      <StoreHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <main className="store-content">
        <ProductList searchTerm={searchTerm} />
      </main>
      <StoreFooter />
    </div>
  )
}

export default Home
