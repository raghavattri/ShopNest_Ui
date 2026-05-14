import React from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';

import Home from "./components/Home"

import Login from './components/Login';
import Register from './components/Register';
import Admin from "./components/Admin"
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import ProductDetails from './components/ProductDetails';
import UserDashboard from './components/UserDashboard';
import { ProtectedRoute } from './features/ProtectedRoute';
import { PreventLogout } from './features/PreventLogout';
const AppRouter = () => {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" 
          element={ 
            <ProtectedRoute>
              <Home/>
            </ProtectedRoute>
          }/>
        <Route path="/login" element={
          <PreventLogout>
            <Login/>
          </PreventLogout>
        } />
        <Route path="/register" element={
          <PreventLogout>
            <Register />
          </PreventLogout>
        }/>
        <Route path="/admin" element={ 
          <ProtectedRoute sellerOnly>
            <Navigate to="/seller" replace />
          </ProtectedRoute>
        } />
        <Route path="/seller" element={
          <ProtectedRoute sellerOnly>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute userOnly>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/products/:id" element={
          <ProtectedRoute>
            <ProductDetails />
          </ProtectedRoute>
        } />
        <Route path="/cart" element={
          <ProtectedRoute userOnly>
            <Cart />
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute userOnly>
            <Checkout />
          </ProtectedRoute>
        } />
      </Routes>


    </BrowserRouter>
  );
};

export default AppRouter;
