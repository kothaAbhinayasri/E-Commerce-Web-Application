import { useEffect, useState } from 'react'
import axios from 'axios'
import { formatCurrency } from "../utils/formatCurrency"

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      setLoading(true)
      const { data } = await axios.get(`${API}/orders/mine`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setOrders(data.orders || [])
      setLoading(false)
    } catch (err) {
      console.error("Error fetching orders:", err)
      setLoading(false)
    }
  }

  if (loading) return <div>Loading orders...</div>

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-indigo-700">My Orders</h2>
      {orders.length === 0 ? (
        <p>You have no orders yet. <a href="/products" className="text-indigo-600 hover:underline">Start shopping</a></p>
      ) : (
        <div className="space-y-6">
          {orders.map(o => (
            <div key={o._id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-semibold text-xl">Order #{o._id.slice(-8)}</div>
                  <div className="text-sm text-gray-600">
                    Placed on {new Date(o.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{formatCurrency(o.total)}</div>
                  <div className={`text-sm px-3 py-1 rounded-full ${
                    o.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                    o.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {o.status}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-700">
                Items: {o.items?.length || 0}
              </div>
              {o.shippingAddress && (
                <div className="text-sm text-gray-700 mt-3">
                  Shipping: {o.shippingAddress}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
