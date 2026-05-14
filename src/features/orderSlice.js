import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' });

API.interceptors.request.use((req) => {
  const profile = localStorage.getItem('profile');

  if (profile) {
    req.headers.Authorization = `Bearer ${JSON.parse(profile).token}`;
  }

  return req;
});

export const createOrder = createAsyncThunk('orders/createOrder', async (payload, { rejectWithValue }) => {
  try {
    const res = await API.post('/api/orders', payload);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to place order' });
  }
});

export const getMyOrders = createAsyncThunk('orders/getMyOrders', async (_, { rejectWithValue }) => {
  try {
    const res = await API.get('/api/orders/my-orders');
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to load orders' });
  }
});

export const getSellerOrders = createAsyncThunk('orders/getSellerOrders', async (_, { rejectWithValue }) => {
  try {
    const res = await API.get('/api/orders');
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to load seller orders' });
  }
});

export const updateOrderStatus = createAsyncThunk('orders/updateOrderStatus', async ({ orderId, status }, { rejectWithValue }) => {
  try {
    const res = await API.patch(`/api/orders/${orderId}/status`, { status });
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to update order status' });
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    latestOrder: null,
    loading: false,
    error: null
  },
  reducers: {
    clearLatestOrder: (state) => {
      state.latestOrder = null;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.latestOrder = action.payload;
        state.items = [action.payload, ...state.items];
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to place order';
      })
      .addCase(getMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load orders';
      })
      .addCase(getSellerOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSellerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getSellerOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load seller orders';
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.items = state.items.map(order =>
          order._id === action.payload._id ? action.payload : order
        );
        state.latestOrder = action.payload;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to update order status';
      });
  }
});

export const { clearLatestOrder } = orderSlice.actions;
export default orderSlice.reducer;
