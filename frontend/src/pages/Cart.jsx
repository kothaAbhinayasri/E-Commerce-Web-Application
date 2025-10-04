import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import { removeFromCart, updateQty, clearCart, fetchCart, removeFromCartAsync } from '../store/slices/cartSlice.js'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from "../utils/formatCurrency"

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Cart() {
  const { items, loading } = useSelector(s => s.cart)
  const user = useSelector(s => s.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [productsMap, setProductsMap] = useState({})

  useEffect(() => {
    if (user) {
      dispatch(fetchCart())
    }
  }, [user, dispatch])

  console.log('Cart items from Redux:', items)
  items.forEach((item, index) => {
    console.log(`Item ${index} product id:`, item.product, 'type:', typeof item.product)
  })
  console.log('Products map:', productsMap)
  Object.entries(productsMap).forEach(([key, value]) => {
    console.log(`Product map key: ${key}, value type: ${typeof value}, value:`, value)
  })

  // Fetch product details for cart items
  useEffect(() => {
    async function fetchProducts() {
      if (items.length === 0) {
        setProductsMap({})
        return
      }
      try {
        const ids = items.map(i => i.product).join(',')
        const { data } = await axios.get(`${API}/products?ids=${ids}`)
        const map = {}
        data.products.forEach(p => {
          map[p._id] = p
        })
        setProductsMap(map)
      } catch (err) {
        console.error('Error fetching products for cart:', err)
      }
    }
    fetchProducts()
  }, [items])

  const subtotal = items.reduce((s, i) => {
    const product = productsMap[i.product]
    const price = product ? product.price : i.price || 0
    return s + (i.quantity || 0) * price
  }, 0)

  async function checkout() {
    if (!user) return navigate('/login')
    try {
      const orderData = {
        items: items.map(i => ({ product: i.product, quantity: i.quantity })),
        shippingAddress: "Default Address" // TODO: Add address form
      }
      const { data } = await axios.post(`${API}/orders`, orderData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const order = data.order
      const { data: payment } = await axios.post(`${API}/payments/pay`, { orderId: order._id }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      // Email sent automatically
      dispatch(clearCart())
      navigate('/orders')
    } catch (err) {
      alert('Checkout failed: ' + (err.response?.data?.message || 'Unknown error'))
    }
  }

  const handleRemove = async (productId) => {
    if (user) {
      dispatch(removeFromCartAsync(productId))
    } else {
      dispatch(removeFromCart(productId))
    }
  }

  const handleUpdateQty = (product, quantity) => {
    dispatch(updateQty({ product, quantity }))
    // TODO: Sync with backend if logged in
  }

  if (loading) return <div>Loading cart...</div>

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-indigo-700">Shopping Cart</h2>
      {items.length === 0 ? (
        <p>Your cart is empty. <a href="/products" className="text-indigo-600 hover:underline">Start shopping</a></p>
      ) : (
        <div className="space-y-4">
          {items.map(i => {
            const product = productsMap[i.product]?._doc || productsMap[i.product]
            // Defensive check: ensure product fields are strings or numbers, not objects
            const title = product && typeof product.title === 'string' ? product.title : ''
            const price = product && typeof product.price === 'number' ? product.price : 0
            const images = product && Array.isArray(product.images) ? product.images : []

            return (
              <div key={i.product} className="flex items-center justify-between border p-4 rounded shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                    {images.length > 0 ? (
                      <img src={images[0]} alt={title} className="max-w-full max-h-full" />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{title || i.product}</div>
                    <input
                      type="number"
                      min={1}
                      className="border p-2 w-24 mt-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      value={i.quantity}
                      onChange={e => handleUpdateQty(i.product, Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-gray-800 font-semibold text-lg">
                    {formatCurrency(price * i.quantity)}
                  </span>
                  <button
                    className="text-red-600 hover:text-red-800 font-semibold"
                    onClick={() => handleRemove(i.product)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          })}

          <div className="flex justify-between items-center pt-6 border-t">
            <div className="text-xl font-bold text-indigo-900">
              Subtotal: {formatCurrency(subtotal)}
            </div>
            <button
              className="bg-indigo-600 text-white px-8 py-3 rounded hover:bg-indigo-700 transition-colors"
              onClick={checkout}
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
