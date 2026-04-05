"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { formatCurrency } from "@/constants/Data"
import { FaStar, FaEdit, FaTrash } from "react-icons/fa"
import { toast } from "react-toastify"
import { ListSkeleton, Skeleton } from "@/components/ui/skeleton"
import Modal from "@/components/ui/Modal"

type Review = {
  id: string
  product_id: number
  user_id: string
  name: string
  avatar_url?: string
  rating: number
  comment: string
  created_at: string
  products?: {
    id: number
    name: string
    image: string
    price: number
  }
  profiles?: {
    name: string | null;
    avatar_url: string | null;
  };
}

type ReviewWithProduct = Review & {
  products: {
    id: number
    name: string
    image: string
    price: number
  }
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [editingReview, setEditingReview] = useState<string | null>(null)
  const [editComment, setEditComment] = useState("")
  const [editRating, setEditRating] = useState(5)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("default")
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchUserAndReviews()
  }, [])

  const fetchUserAndReviews = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        products(id, name, image, price),
        profiles(name, avatar_url)
      `)

    if (!error && data) {
      setReviews(data as ReviewWithProduct[])
    }
    setLoading(false)
  }

  const handleEdit = async (reviewId: string) => {
    if (!user) return

    const { error } = await supabase
      .from("reviews")
      .update({
        comment: editComment,
        rating: editRating
      })
      .eq("id", reviewId)
      .eq("user_id", user.id)

    if (error) {
      toast.error("Error updating review: " + error.message)
    } else {
      setReviews(reviews.map(r =>
        r.id === reviewId
          ? { ...r, comment: editComment, rating: editRating }
          : r
      ))
      setEditingReview(null)
      setEditComment("")
      setEditRating(5)
    }
  }

  const handleDelete = async () => {
    if (!reviewToDelete || !user) return

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewToDelete)
      .eq("user_id", user.id)

    if (error) {
      toast.error("Error deleting review: " + error.message)
    } else {
      setReviews(reviews.filter(r => r.id !== reviewToDelete))
      toast.success("Review deleted successfully")
    }
    setReviewToDelete(null)
  }

  const startEdit = (review: ReviewWithProduct) => {
    setEditingReview(review.id)
    setEditComment(review.comment)
    setEditRating(review.rating)
  }

  const cancelEdit = () => {
    setEditingReview(null)
    setEditComment("")
    setEditRating(5)
  }

  const filteredReviews = reviews.filter(review =>
    review.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.products?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case "rating-high":
        return b.rating - a.rating
      case "rating-low":
        return a.rating - b.rating
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="px-10 lg:px-30 py-16">
        <Skeleton className="h-10 w-48 mb-10" />
        <ListSkeleton items={5} />
      </div>
    )
  }

  return (
    <div className="px-10 lg:px-30 py-16">
      <h1 className="text-4xl font-semibold mb-10">All Reviews</h1>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input type="text" placeholder="Search reviews..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-black" />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-black"  >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="rating-high">Highest Rating</option>
          <option value="rating-low">Lowest Rating</option>
        </select>
      </div>

      <div className="space-y-6">
        {sortedReviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm ? "No reviews found matching your search." : "No reviews yet."}
            </p>
          </div>
        ) : (
          sortedReviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-6 bg-white">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-4">
                  {review.products?.image && (
                    <img
                      src={review.products.image}
                      alt={review.products.name}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  )}

                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {review.profiles?.avatar_url ? (
                        <img
                          src={supabase.storage.from("avatars").getPublicUrl(review.profiles.avatar_url).data.publicUrl}
                          className="w-10 h-10 rounded-full border object-cover bg-gray-50 shadow-sm"
                          alt={review.name}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full border flex items-center justify-center bg-[#141718] text-white font-bold text-sm shadow-sm">
                          {(review.profiles?.name || review.name).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-base leading-tight">{review.name}</h4>
                        <span className="text-xs text-gray-500">
                          on {review.products?.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={i < review.rating ? "text-black" : "text-gray-300"}
                        />
                      ))}
                    </div>

                    <p className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {user && review.user_id === user.id && (
                    <>
                      <button
                        onClick={() => startEdit(review)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit review"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => setReviewToDelete(review.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete review"
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {editingReview === review.id ? (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setEditRating(star)}
                        className="text-xl"
                      >
                        <FaStar className={editRating >= star ? "text-black" : "text-gray-300"} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-black resize-none"
                    rows={3}
                    placeholder="Update your review..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(review.id)}
                      className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t pt-4">
                  <p className="text-gray-700 leading-relaxed">
                    {review.comment || "No comment provided."}
                  </p>
                  {review.products && (
                    <div className="mt-4 text-sm text-gray-500">
                      Product Price: {formatCurrency(review.products.price)}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Review Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold text-black">{reviews.length}</p>
            <p className="text-sm text-gray-600">Total Reviews</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-black">
              {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "0"}
            </p>
            <p className="text-sm text-gray-600">Average Rating</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-black">
              {reviews.filter(r => r.rating === 5).length}
            </p>
            <p className="text-sm text-gray-600">5-Star Reviews</p>
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!reviewToDelete}
        onClose={() => setReviewToDelete(null)}
        title="Delete Review"
      >
        <div className="space-y-6">
          <p className="text-gray-600 font-medium leading-relaxed">Are you sure you want to delete this review? This action cannot be undone.</p>
          <div className="flex gap-3 pt-4 justify-end">
            <button
              onClick={() => setReviewToDelete(null)}
              className="px-6 py-2.5 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all text-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg active:scale-95"
            >
              Delete Review
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
