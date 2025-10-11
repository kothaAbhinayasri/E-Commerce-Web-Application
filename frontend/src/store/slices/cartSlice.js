import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'
import { showNotification } from './notificationSlice'

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get('/cart')
      // Transform items to have product as product._id string
      const items = (data.cart.items || []).map(item => ({
        ...item,
        product: typeof item.product === 'object' && item.product !== null ? item.product._id : item.product
      }))
      return items
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch cart')
    }
  }
)

export const addToCartAsync = createAsyncThunk(
  'cart/addToCartAsync',
  async ({ productId, quantity }, thunkAPI) => {
    try {
      const { data } = await api.post('/cart/add', { productId, quantity })
      return data.cart.items || []
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to add to cart')
    }
  }
)

export const removeFromCartAsync = createAsyncThunk(
  'cart/removeFromCartAsync',
  async (productId, thunkAPI) => {
    try {
      const { data } = await api.delete(`/cart/remove/${productId}`)
      return data.cart.items || []
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to remove from cart')
    }
  }
)

const slice = createSlice({
  name: 'cart',
  initialState: { items: JSON.parse(localStorage.getItem('ecom_cart') || '[]'), loading: false, error: null },
  reducers: {
    addToCart(state, action) {
      const item = action.payload
      const existing = state.items.find(i => i.product === item.product)
      if (existing) existing.quantity += item.quantity || 1
      else state.items.push({ ...item, quantity: item.quantity || 1 })
      localStorage.setItem('ecom_cart', JSON.stringify(state.items))
    },
    removeFromCart(state, action) {
      state.items = state.items.filter(i => i.product !== action.payload)
      localStorage.setItem('ecom_cart', JSON.stringify(state.items))
    },
    updateQty(state, action) {
      const { product, quantity } = action.payload
      const it = state.items.find(i => i.product === product)
      if (it) it.quantity = quantity
      localStorage.setItem('ecom_cart', JSON.stringify(state.items))
    },
    clearCart(state) {
      state.items = []
      localStorage.setItem('ecom_cart', JSON.stringify(state.items))
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload
        state.loading = false
        localStorage.setItem('ecom_cart', JSON.stringify(state.items))
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(addToCartAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.items = action.payload
        state.loading = false
        localStorage.setItem('ecom_cart', JSON.stringify(state.items))
        thunkAPI.dispatch(showNotification({ message: 'Product added to cart successfully!', severity: 'success' }))
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(removeFromCartAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.items = action.payload
        state.loading = false
        localStorage.setItem('ecom_cart', JSON.stringify(state.items))
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { addToCart, removeFromCart, updateQty, clearCart } = slice.actions
export default slice.reducer
