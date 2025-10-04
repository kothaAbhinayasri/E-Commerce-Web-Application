import { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addToCartAsync } from '../store/slices/cartSlice.js'
import { formatCurrency } from "../utils/formatCurrency"

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const dispatch = useDispatch()
  const user = useSelector(s => s.auth.user)

  useEffect(() => {
    fetchProduct()
    fetchReviews()
    fetchRecommendations()
  }, [id])

  async function fetchProduct() {
    try {
      const { data } = await axios.get(`${API}/products/${id}`)
      setProduct(data)
    } catch (err) {
      console.error("Error fetching product:", err)
    }
  }

  async function fetchReviews() {
    try {
      const { data } = await axios.get(`${API}/products/${id}/reviews`)
      setReviews(data.reviews || [])
    } catch (err) {
      console.error("Error fetching reviews:", err)
    }
  }

  async function fetchRecommendations() {
    try {
      const { data } = await axios.get(`${API}/products/${id}/recommendations`)
      setRecommendations(data.recommendations || [])
    } catch (err) {
      console.error("Error fetching recommendations:", err)
    }
  }

  async function submitReview(e) {
    e.preventDefault()
    if (!user) return alert('Please login to review')
    try {
      await axios.post(`${API}/products/${id}/reviews`, reviewForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setReviewForm({ rating: 5, comment: '' })
      fetchReviews()
      fetchProduct() // to update rating
    } catch (err) {
      alert('Error submitting review')
    }
  }

  if (!product) return <div>Loading...</div>

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="aspect-square bg-gray-100 rounded flex items-center justify-center">
          {product.image ? (
  <img src={product.image} alt={product.title} className="max-w-full max-h-full" />
) : product.images && product.images[0] ? (
  <img src={product.images[0]} alt={product.title} className="max-w-full max-h-full" />
) : (
  <span className="text-gray-400">No Image</span>
)}

          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
          <div className="text-2xl mb-4 text-green-600">{formatCurrency(product.price)}</div>
          <div className="text-yellow-500 mb-4">⭐ {product.rating || 0} ({product.numReviews || 0} reviews)</div>
          <p className="text-gray-700 mb-6">{product.description}</p>
          <div className="mb-4">
            <span className="font-medium">Category:</span> {product.category?.name || 'N/A'}
          </div>
          <div className="mb-4">
            <span className="font-medium">Stock:</span> {product.stock || 0}
          </div>
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={() => dispatch(addToCartAsync({ productId: product._id, quantity: 1 }))}
            disabled={!product.stock}
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Reviews */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
        {reviews.map(r => (
          <div key={r._id} className="border-b py-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">{r.name}</span>
              <span className="text-yellow-500">⭐ {r.rating}</span>
            </div>
            <p>{r.comment}</p>
          </div>
        ))}

        {user && (
          <form onSubmit={submitReview} className="mt-6 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Add Review</h3>
            <select
              value={reviewForm.rating}
              onChange={e => setReviewForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
              className="border p-2 mb-2"
            >
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Stars</option>)}
            </select>
            <textarea
              placeholder="Your review"
              value={reviewForm.comment}
              onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
              className="border p-2 w-full mb-2"
              rows={3}
            />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Submit</button>
          </form>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">You Might Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {recommendations.map(p => (
              <Link
                to={`/products/${p._id}`}
                key={p._id}
                className="border rounded p-4 hover:shadow"
              >
                <div className="aspect-square bg-gray-100 rounded mb-2 overflow-hidden flex items-center justify-center">
                  {p.images && p.images[0] ? (
                    <img src={p.images[0]} alt={p.title} className="max-w-full max-h-full" />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </div>
                <div className="font-medium">{p.title}</div>
                <div className="text-sm text-gray-600">{formatCurrency(p.price)}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
