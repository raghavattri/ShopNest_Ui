import React from 'react';
import ProductList from './components/ProductList';
import Filters from './components/Filters';
import './App.css';
import AppRouter from "./AppRouter";

function App() {
  return (
    <div className="app-container">
      <AppRouter/>
    </div>
  );
}

export default App;
