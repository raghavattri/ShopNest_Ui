import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../features/authSlice';
import './Register.css';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {

  const dispatch = useDispatch();

  const authError = useSelector(state => state.auth.error);
  const loading = useSelector(state => state.auth.loading);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer'
  });
  const navigate = useNavigate()
  const { username, email, password, confirmPassword, role } = formData;

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    const result = await dispatch(register({ formData, navigate }));
    if (register.rejected.match(result)) {
      setError(result.payload || 'Registration failed');
    }
  };

  return (

    <div className="register-container">
      <section className="auth-card">
        <div className="auth-brand">ShopNest</div>
        <div className="auth-copy">
          <h2>Create account</h2>
          <p className="auth-subtitle">Enter your details to get started.</p>
        </div>
        {(error || authError) && <div className="error">{error || authError}</div>}
        <form onSubmit={handleSubmit} className='register-form'>
          <div className="role-selector">
            <label className={role === 'buyer' ? 'selected' : ''}>
              <input
                type="radio"
                name="role"
                value="buyer"
                checked={role === 'buyer'}
                onChange={handleChange}
              />
              Buyer
            </label>
            <label className={role === 'seller' ? 'selected' : ''}>
              <input
                type="radio"
                name="role"
                value="seller"
                checked={role === 'seller'}
                onChange={handleChange}
              />
              Seller
            </label>
          </div>
          <div className='register-input-group'>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={handleChange}
              placeholder='your name'
              required
            />
          </div>
          <div className='register-input-group'>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder='your email@gmail.com'
              required
            />
          </div>
          <div className='register-input-group'>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder='Password'
              required
            />
          </div>
          <div className='register-input-group'>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              placeholder='Confirm Password'
              required
            />
          </div>
          <button type="submit" className='login-register-button' disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="auth-switch">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
    
    </div>

  );
};

export default Register;
