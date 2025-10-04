import { useEffect, useState } from 'react'
import axios from 'axios'
import { formatCurrency } from "../utils/formatCurrency"

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Admin(){
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    price: '',
    description: '',
    category: '',
    stock: ''
  })
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    fetchProducts()
    fetchOrders()
  }, [])

  async function fetchProducts() {
    try {
      const { data } = await axios.get(`${API}/products`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setProducts(data.products || [])
    } catch (err) {
      console.error("Error fetching products:", err)
    }
  }

  async function fetchOrders() {
    try {
      const { data } = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setOrders(data.orders || [])
    } catch (err) {
      console.error("Error fetching orders:", err)
    }
  }

  async function createProduct() {
    try {
      await axios.post(`${API}/products`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setForm({ title: '', price: '', description: '', category: '', stock: '' })
      fetchProducts()
    } catch (err) {
      alert('Error creating product')
    }
  }

  async function updateProduct() {
    try {
      await axios.put(`${API}/products/${editing}`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setEditing(null)
      setForm({ title: '', price: '', description: '', category: '', stock: '' })
      fetchProducts()
    } catch (err) {
      alert('Error updating product')
    }
  }

  async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return
    try {
      await axios.delete(`${API}/products/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      fetchProducts()
    } catch (err) {
      alert('Error deleting product')
    }
  }

  async function updateOrderStatus(id, status) {
    try {
      await axios.put(`${API}/orders/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      fetchOrders()
    } catch (err) {
      alert('Error updating order status')
    }
  }

  const handleFormChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const startEdit = (product) => {
    setEditing(product._id)
    setForm({
      title: product.title,
      price: product.price,
      description: product.description,
      category: product.category,
      stock: product.stock
    })
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <h1 className="text-3xl font-bold text-indigo-700">Admin Dashboard</h1>

      {/* Product Management */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-6 bg-indigo-50 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold mb-4">{editing ? 'Edit Product' : 'Add New Product'}</h2>
          <div className="space-y-4">
            <input
              className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Title"
              value={form.title}
              onChange={e => handleFormChange('title', e.target.value)}
            />
            <input
              type="number"
              className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Price"
              value={form.price}
              onChange={e => handleFormChange('price', e.target.value)}
            />
            <input
              type="number"
              className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Stock"
              value={form.stock}
              onChange={e => handleFormChange('stock', e.target.value)}
            />
            <input
              className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Category"
              value={form.category}
              onChange={e => handleFormChange('category', e.target.value)}
            />
            <textarea
              className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Description"
              value={form.description}
              onChange={e => handleFormChange('description', e.target.value)}
              rows={4}
            />
            <div className="flex gap-4">
              <button
                className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition-colors"
                onClick={editing ? updateProduct : createProduct}
              >
                {editing ? 'Update' : 'Create'}
              </button>
              {editing && (
                <button
                  className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors"
                  onClick={() => { setEditing(null); setForm({ title: '', price: '', description: '', category: '', stock: '' }) }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Products List</h2>
          <div className="space-y-4 max-h-[480px] overflow-y-auto">
            {products.map(p => (
              <div key={p._id} className="border p-4 rounded shadow-sm hover:shadow-md transition-shadow flex justify-between items-center">
                <div>
                  <div className="font-semibold text-lg">{p.title}</div>
                  <div className="text-sm text-gray-600">{formatCurrency(p.price)} • Stock: {p.stock}</div>
                </div>
                <div className="flex gap-4">
                  <button
                    className="text-indigo-600 hover:text-indigo-800 font-semibold"
                    onClick={() => startEdit(p)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 font-semibold"
                    onClick={() => deleteProduct(p._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Management */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Order Management</h2>
        <div className="space-y-4 max-h-[480px] overflow-y-auto">
          {orders.map(o => (
            <div key={o._id} className="border p-4 rounded shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-semibold text-lg">Order #{o._id.slice(-8)}</div>
                  <div className="text-sm text-gray-600">
                    User: {o.user?.name || 'N/A'} • Total: {formatCurrency(o.total)}
                  </div>
                </div>
                <select
                  value={o.status}
                  onChange={e => updateOrderStatus(o._id, e.target.value)}
                  className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="text-sm text-gray-700">
                Items: {o.items?.length || 0}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
