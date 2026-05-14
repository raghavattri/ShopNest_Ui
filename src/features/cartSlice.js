import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = axios.create({baseURL: "http://localhost:5000"});

const getStoredCartItems = () => {
  try {
    const cartItems = localStorage.getItem('cartItems');
    return cartItems ? JSON.parse(cartItems) : [];
  } catch (error) {
    localStorage.removeItem('cartItems');
    return [];
  }
};

const persistCartItems = (cartItems) => {
  localStorage.setItem('cartItems', JSON.stringify(cartItems));
};

API.interceptors.request.use((req)=>{
      if(localStorage.getItem("profile")){
            req.headers.Authorization = `Bearer ${
                  JSON.parse(localStorage.getItem("profile")).token
            }`
      }
      return req;
})

export const getData = createAsyncThunk("cart/getData", async (payload,{ rejectWithValue }) => {
  try {
    const res = await axios.get("http://localhost:5000/api/products");
    return res.data
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to fetch products' });
  }
})

export const getProductById = createAsyncThunk("cart/getProductById", async (id, { rejectWithValue }) => {
  try {
    const res = await axios.get(`http://localhost:5000/api/products/${id}`);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to fetch product' });
  }
})

export const addProduct = createAsyncThunk("cart/addProduct", async (payload,{ rejectWithValue }) => {
  try {

    const res = await API.post("/api/seller/products", payload);
    return res.data
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to add product' });
  }
})

export const updateProduct = createAsyncThunk("cart/updateProduct", async ({id, finalData }, {rejectWithValue})=>{
  try {
    const res = await API.patch(`/api/seller/products/${id}`, finalData);
    return res.data
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to update product' });
  }
})

export const deleteProduct = createAsyncThunk("cart/deleteProduct", async (id, {rejectWithValue})=>{
  try{
    const res = await API.delete(`/api/seller/products/${id}`);
    return res.data;
  }catch(error){
    return rejectWithValue(error.response?.data || { message: 'Failed to delete product' });
  }
})

export const uploadProductImage = createAsyncThunk("cart/uploadProductImage", async (file, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const res = await API.post('/api/seller/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to upload image' });
  }
})

export const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    currentCategory: 'all',
    categories: [],
    showItems: [],
    availableColors: [],
    totalProducts: 0,
    selectedProduct: null,
    selectedProductError: null,
    cartItems: getStoredCartItems(),
    loading: false,
  },
  reducers: {
    getInitialData: (state, action) => {
      console.log(state.items)
      
    },

    updateList: (state, action) => {
      state.currentCategory = action.payload.value;
      let filteredProducts;
      if (action.payload.type === 'category') {
        filteredProducts = state.items.filter(product =>
          product.category.toLowerCase() === action.payload.value.toLowerCase()
        );
      } else {
        filteredProducts = state.items.filter(product =>
          product.variants.some(variant =>
            variant.color &&
            variant.color.toLowerCase() === action.payload.value.toLowerCase()
          )
        );
        
      }
      state.showItems = filteredProducts;
    },

    resetFilters: (state, action) =>{
      state.currentCategory= 'all',
      state.showItems=[];
      state.showItems = [...state.items];
    },

    addToCart: (state, action) => {
      const { product, quantity = 1, selectedColor = '', selectedSize = '' } = action.payload;
      const existingItem = state.cartItems.find(item =>
        item.product._id === product._id &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cartItems.push({
          cartItemId: `${product._id}-${selectedColor || 'default'}-${selectedSize || 'default'}`,
          product,
          quantity,
          selectedColor,
          selectedSize
        });
      }

      persistCartItems(state.cartItems);
    },

    increaseCartQuantity: (state, action) => {
      const item = state.cartItems.find(cartItem => cartItem.cartItemId === action.payload || cartItem.product._id === action.payload);

      if (item) {
        item.quantity += 1;
      }

      persistCartItems(state.cartItems);
    },

    decreaseCartQuantity: (state, action) => {
      const item = state.cartItems.find(cartItem => cartItem.cartItemId === action.payload || cartItem.product._id === action.payload);

      if (item && item.quantity > 1) {
        item.quantity -= 1;
      } else {
        state.cartItems = state.cartItems.filter(cartItem => (cartItem.cartItemId || cartItem.product._id) !== action.payload);
      }

      persistCartItems(state.cartItems);
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(item => (item.cartItemId || item.product._id) !== action.payload);
      persistCartItems(state.cartItems);
    },

    clearCart: (state) => {
      state.cartItems = [];
      persistCartItems(state.cartItems);
    },

  },
  extraReducers(builder) {
    builder.addCase(
      getData.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(getData.fulfilled, (state, action) => {
        
        state.items = action.payload;
        
        const uniqueCategories = action.payload.reduce((categories, product) => {
          if (product.category) {
            const categoryIndex = categories.findIndex(cat => cat.name === product.category.toLowerCase());
            if (categoryIndex !== -1) {
              categories[categoryIndex].number++;
            } else {
              categories.push({ name: product.category.toLowerCase(), number: 1 });
            }
          }
          return categories;
        }, []);
    
        const uniqueColors = action.payload.reduce((availableColors, product) => {
          product.variants.forEach(variant => {
            if (variant.color) {
              const colorIndex = availableColors.findIndex(col => col.name === variant.color.toLowerCase());
              if (colorIndex !== -1) {
                availableColors[colorIndex].number++;
              } else {
                availableColors.push({ name: variant.color.toLowerCase(), number: 1 });
              }
            }
          });
          return availableColors;
        }, []);
        
        state.categories = uniqueCategories;
        state.availableColors = uniqueColors;
        state.totalProducts = action.payload.length;
        state.loading = false;
        state.showItems = action.payload;

      })
      .addCase(getData.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(getProductById.pending, (state) => {
        state.loading = true;
        state.selectedProductError = null;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.loading = false;
        state.selectedProduct = null;
        state.selectedProductError = action.payload?.message || 'Product not found';
      })
      .addCase(addProduct.pending, (state, action)=>{
        state.loading =true
      })
      .addCase(addProduct.fulfilled, (state, action)=>{
        state.pending =false;
      })
      .addCase(addProduct.rejected, (state, action)=>{
        state.loading = false;
      })
      .addCase(updateProduct.pending, (state, action)=>{
        state.loading =true
      })
      .addCase(updateProduct.fulfilled, (state, action)=>{
        state.pending =false;
        console.log(action.payload);
      })
      .addCase(updateProduct.rejected, (state, action)=>{
        state.loading = false;
      })
      .addCase(deleteProduct.pending, (state, action)=>{
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action)=>{
        state.items = action.payload;
        
        const uniqueCategories = action.payload.reduce((categories, product) => {
          if (product.category) {
            const categoryIndex = categories.findIndex(cat => cat.name === product.category.toLowerCase());
            if (categoryIndex !== -1) {
              categories[categoryIndex].number++;
            } else {
              categories.push({ name: product.category.toLowerCase(), number: 1 });
            }
          }
          return categories;
        }, []);
    
        const uniqueColors = action.payload.reduce((availableColors, product) => {
          product.variants.forEach(variant => {
            if (variant.color) {
              const colorIndex = availableColors.findIndex(col => col.name === variant.color.toLowerCase());
              if (colorIndex !== -1) {
                availableColors[colorIndex].number++;
              } else {
                availableColors.push({ name: variant.color.toLowerCase(), number: 1 });
              }
            }
          });
          return availableColors;
        }, []);
        
        state.categories = uniqueCategories;
        state.availableColors = uniqueColors;
        state.totalProducts = action.payload.length;
        state.loading = false;
        state.showItems = action.payload;
      })
      .addCase(deleteProduct.rejected, (state, action)=>{
        state.loading = false;
      })
     }
});

export const {
  getInitialData,
  updateList,
  resetFilters,
  addToCart,
  increaseCartQuantity,
  decreaseCartQuantity,
  removeFromCart,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;
