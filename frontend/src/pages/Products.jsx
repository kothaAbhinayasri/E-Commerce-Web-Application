import { useEffect, useState } from 'react'
import axios from '../api/axios'
import { Link } from 'react-router-dom'
import { formatCurrency } from "../utils/formatCurrency"

export default function Products() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    sort: 'createdAt',
    order: 'desc'
  })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => { fetchProducts() }, [filters, page])

  async function fetchProducts() {
    try {
      setLoading(true)
      const params = { ...filters, page, limit: 12 }
      Object.keys(params).forEach(key => params[key] === '' && delete params[key])
      const { data } = await axios.get(`/products`, { params })
      setItems(data.products || [])
      setTotalPages(data.pages || 1)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching products:", err)
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1) // reset to first page
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">Products</h1>

      {/* Filters */}
      <div className="mb-6 p-4 bg-indigo-50 rounded-lg shadow-inner">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Search keyword"
            value={filters.keyword}
            onChange={e => handleFilterChange('keyword', e.target.value)}
          />
          <input
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Category"
            value={filters.category}
            onChange={e => handleFilterChange('category', e.target.value)}
          />
          <input
            type="number"
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={e => handleFilterChange('minPrice', e.target.value)}
          />
          <input
            type="number"
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={e => handleFilterChange('maxPrice', e.target.value)}
          />
        </div>
        <div className="mt-4 flex gap-4">
          <select
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={filters.sort}
            onChange={e => handleFilterChange('sort', e.target.value)}
          >
            <option value="createdAt">Newest</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
          </select>
          <select
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={filters.order}
            onChange={e => handleFilterChange('order', e.target.value)}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {items.map(p => (
              <Link
                to={`/products/${p._id}`}
                key={p._id}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white"
              >
                <div className="aspect-square bg-gray-100 rounded mb-2 overflow-hidden flex items-center justify-center">
                {p.image ? (
  <img src={p.image} alt={p.title} className="object-cover w-full h-full" />
) : p.images && p.images.length > 0 ? (
  <img src={p.images[0]} alt={p.title} className="object-cover w-full h-full" />
) : (
  <span className="text-gray-400">No Image</span>
)}

                </div>
                <div className="font-medium text-indigo-900">{p.title}</div>
                <div className="text-sm text-gray-600">{formatCurrency(p.price)}</div>
                <div className="text-sm text-yellow-500">⭐ {p.rating || 0}</div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}
