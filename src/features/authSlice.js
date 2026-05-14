import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios'
import { API_BASE_URL } from './apiConfig';

const API_URL = `${API_BASE_URL}/api/users`;

const getStoredProfile = () => {
  try {
    const profile = localStorage.getItem('profile');
    return profile ? JSON.parse(profile) : null;
  } catch (error) {
    localStorage.removeItem('profile');
    return null;
  }
};

export const register = createAsyncThunk('auth/register', async ({ formData, navigate }, { rejectWithValue }) => {
  try {
    const { confirmPassword, ...registrationData } = formData;
    const response = await axios.post(`${API_URL}/register`, registrationData);
    navigate("/login");

    return response.data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});


export const login = createAsyncThunk('auth/login', async (
  { username, password }, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

const storedProfile = getStoredProfile();
const isSellerRole = (role) => role === 'seller' || role === 'admin';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedProfile?.user || null,
    token: storedProfile?.token || null,
    loggedIn: Boolean(storedProfile?.token),
    loading: false,
    error: null,
    isSeller: isSellerRole(storedProfile?.user?.role),
    isAdmin: isSellerRole(storedProfile?.user?.role)
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loggedIn = false;
      state.isSeller = false;
      state.isAdmin = false;
      state.error = null;
      localStorage.removeItem('profile');
    }
  },
  extraReducers: builder => {
    builder
      .addCase(register.pending, state => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(login.pending, state => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loggedIn = true;
        state.isSeller = isSellerRole(action.payload.user?.role);
        state.isAdmin = isSellerRole(action.payload.user?.role);
        state.error = null;
        localStorage.setItem("profile", JSON.stringify(action.payload));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { logout} = authSlice.actions;
export default authSlice.reducer;

