import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../features/authSlice';
import './Login.css';
import { Link, useNavigate } from 'react-router-dom';
const Login = () => {

  const user = useSelector(state => state.auth.user);
  const isLoggedin = useSelector(state => state.auth.loggedIn);
  const authError = useSelector(state => state.auth.error);
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isNavigated, setIsNavigated] = useState(false);



  useEffect(() => {
    if (isLoggedin && !isNavigated) {
      setIsNavigated(true);
      if (user?.role === 'seller' || user?.role === 'admin') {
        navigate('/seller');
      } else {
        navigate('/');
      }
    }
  }, [isLoggedin, isNavigated, navigate, user]);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleLogin = () => {
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setError('');
    dispatch(login({ username, password }));
  };

  return (
    <div className="login-container">
      <section className="auth-card">
        <div className="auth-brand">ShopNest</div>
        <div className="auth-copy">
          <h2>Sign in</h2>
          <p className="auth-subtitle">Welcome back. Please enter your details.</p>
        </div>

        {error && <div className="error">{error}</div>}

        <form className='login-form'>
          <div className="login-input-group">
            <label htmlFor="username">Email or username</label>
            <input
              id="username"
              type="text"
              value={username}
              placeholder='raghav@example.com'
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="login-input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              placeholder='Enter your password'
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="button" onClick={handleLogin} className='login-register-button'>
            Sign in
          </button>
        </form>

        <p className="auth-switch">
          New to ShopNest? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </div>
  );
};

export default Login;
