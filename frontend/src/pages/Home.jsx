import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { formatCurrency } from "../utils/formatCurrency"

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Home(){
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchFeatured()
  }, [])

  async function fetchFeatured() {
    try {
      setLoading(true)
      const { data } = await axios.get(`${API}/products`, { params: { limit: 8 } })
      setFeatured(data.products || [])
      setLoading(false)
    } catch (err) {
      console.error("Error fetching featured products:", err)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-lg shadow-lg">
      <h1 className="text-4xl font-extrabold mb-4 text-indigo-700 drop-shadow-md">
        Welcome to the Store
      </h1>
      <p className="text-lg text-indigo-600 mb-6">
        Browse our latest products and start shopping with confidence.
      </p>

      <h2 className="text-2xl font-semibold mb-4 text-purple-700">Featured Products</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {featured.map(p => (
            <Link
              to={`/products/${p._id}`}
              key={p._id}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white"
            >
              <div className="aspect-square bg-gray-100 rounded mb-2 overflow-hidden flex items-center justify-center">
                {p.images && p.images.length > 0 ? (
                  <img src={p.images[0]} alt={p.title} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
              </div>
              <div className="font-medium text-indigo-900">{p.title}</div>
              <div className="text-sm text-gray-600">{formatCurrency(p.price)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
