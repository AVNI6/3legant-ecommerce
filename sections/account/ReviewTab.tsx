"use client";

import { FaStar } from "react-icons/fa6";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import ReviewSummary from "@/components/review-summary";
import { ReviewSkeleton } from "@/components/ui/skeleton";
import { useAppSelector } from "@/store/hooks";
import ReviewItem from "@/components/ReviewItem";

type Review = {
  id: string;
  product_id: number;
  user_id: string | null;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
  status: string;
  review_likes: { count: number }[];
  review_replies: any[];
  profiles?: {
    name: string | null;
    avatar_url: string | null;
  };
};

export default function ReviewTab({
  productId,
  onReviewStatsChange,
}: {
  productId: number;
  onReviewStatsChange?: (stats: { rating: number; count: number }) => void;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const { user } = useAppSelector((state: any) => state.auth);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [visible, setVisible] = useState(5);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ show: boolean; msg: string; confirm?: () => void }>({
    show: false,
    msg: "",
  });

  const lastFetchedProductIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (productId) {
      loadData();
      setupRealtime();
    }
    return () => {
      supabase.channel(`product-reviews-${productId}`).unsubscribe();
    };
  }, [productId]);

  const setupRealtime = () => {
    supabase
      .channel(`product-reviews-${productId}`)
      // 1. Listen for New Reviews (Instant Display)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'reviews',
        filter: `product_id=eq.${productId}`
      }, async (payload) => {
        // Fetch full data for the new review (including profile)
        const { data } = await supabase
          .from("reviews")
          .select("*, profiles(name, avatar_url), review_likes(count), review_replies(*)")
          .eq("id", payload.new.id)
          .single();
        if (data) setReviews(prev => [data, ...prev]);
      })
      // 2. Listen for Spam/Updates
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'reviews',
        filter: `product_id=eq.${productId}`
      }, (payload) => {
        if (payload.new.status === 'spam') {
          setReviews(prev => prev.filter(r => r.id !== payload.new.id));
        }
      })
      .subscribe();
  };

  const loadData = async () => {
    lastFetchedProductIdRef.current = productId;

    // Optimized joined query
    const { data: reviewsData, error: reviewsError } = await supabase
      .from("reviews")
      .select(`
        *, 
        profiles(name, avatar_url),
        review_likes(count),
        review_replies(*, profiles(name, avatar_url))
      `)
      .eq("product_id", productId)
      .or("status.neq.spam,status.is.null"); // SHOW BOTH APPROVED AND NEW REVIEWS

    let finalReviews = reviewsData || [];

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError);
      finalReviews = [];
    }

    setReviews(finalReviews);

    // Calculate and notify stats from fetched reviews
    const avgRating = finalReviews.length > 0
      ? finalReviews.reduce((s, r) => s + r.rating, 0) / finalReviews.length
      : 0;

    // Safety: Only notify if values actually changed to prevent loops
    onReviewStatsChange?.({ rating: avgRating, count: finalReviews.length });

    setLoading(false);
  };

  const postReview = async () => {
    if (!user) {
      setModal({ show: true, msg: "Please login to post a review" });
      return;
    }

    if (!comment.trim()) return;

    try {
      const { error } = await supabase.from("reviews").insert({
        comment: comment.trim(),
        rating,
        product_id: productId,
        user_id: user.id,
        name: user.user_metadata?.name || user.email?.split("@")[0],
      });

      if (error) {
        if (error.code === '23505') {
          setModal({ show: true, msg: "You have already reviewed this product. You can edit your existing review below." });
        } else {
          setModal({ show: true, msg: error.message || "Failed to post review" });
        }
        return;
      }

      setComment("");
      setRating(5);
      // Removed manual loadData() as we rely on Realtime INSERT
    } catch (err: any) {
      setModal({ show: true, msg: "An unexpected error occurred." });
    }
  };

  const displayed = [...reviews].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sort === "newest" ? dateB - dateA : dateA - dateB;
  });

  if (loading) return <ReviewSkeleton />;

  return (
    <div className="mt-8 sm:mt-12">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="font-poppins font-medium text-2xl sm:text-[28px] text-[#141718] tracking-tight">Customer Reviews</h1>
        <div className="flex items-center gap-4">
          <ReviewSummary rating={reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0} count={reviews.length} />
        </div>
      </div>

      {/* Review Box - Conditional Visibility */}
      <div className="relative mb-12">
        {user && reviews.some(r => r.user_id === user.id) ? (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
            <p className="text-[#141718] font-medium mb-1">You have already reviewed this product.</p>
            <p className="text-gray-400 text-sm">You can edit or delete your existing review in the list below.</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 items-center bg-white border-2 border-gray-100 rounded-2xl p-4 sm:p-6 transition-shadow hover:shadow-md">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={user ? "Share your thoughts..." : "Please login to write a review"}
              disabled={!user}
              rows={1}
              className="w-full sm:flex-1 resize-none border-none text-sm focus:outline-none placeholder:text-gray-400 font-inter py-2"
            />
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => user && setRating(s)}>
                    <FaStar className={`text-xl transition-colors ${rating >= s ? "text-[#141718]" : "text-gray-200"}`} />
                  </button>
                ))}
              </div>
              <button
                onClick={postReview}
                disabled={!user || !comment.trim()}
                className="bg-[#141718] text-white px-8 py-3 rounded-full text-sm font-bold transition-all hover:bg-gray-800 disabled:opacity-30 disabled:grayscale"
              >
                Write Review
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reviews List Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#141718] tracking-tight">{reviews.length} Reviews</h2>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="w-full sm:w-auto border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold bg-white outline-none"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      <div className="divide-y divide-gray-100">
        {displayed.slice(0, visible).map((review) => (
          <ReviewItem
            key={review.id}
            review={review}
            onDelete={(id) => setReviews(prev => prev.filter(r => r.id !== id))}
          />
        ))}
      </div>

      {visible < reviews.length && (
        <div className="text-center mt-12 mb-16">
          <button
            onClick={() => setVisible(v => v + 5)}
            className="border-2 border-[#141718] px-10 py-3 rounded-full font-bold hover:bg-gray-50 transition-all text-[#141718] text-sm"
          >
            Load more
          </button>
        </div>
      )}

      {/* Modal for alerts */}
      {modal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={() => setModal({ show: false, msg: "" })}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <p className="mb-8 font-medium text-[#141718]">{modal.msg}</p>
            <button onClick={() => setModal({ show: false, msg: "" })} className="w-full py-3 bg-[#141718] text-white rounded-xl font-bold">
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}