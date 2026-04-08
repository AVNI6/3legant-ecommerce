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
  initialReviews,
}: {
  productId: number;
  onReviewStatsChange?: (stats: { rating: number; count: number }) => void;
  initialReviews?: Review[];
}) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews ?? []);
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
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);

  const lastFetchedProductIdRef = useRef<number | null>(null);

  useEffect(() => {
    let channel: any;
    if (productId) {
      if (initialReviews?.length) {
        setLoading(false);
        const avgRating = initialReviews.length > 0
          ? initialReviews.reduce((s, r) => s + r.rating, 0) / initialReviews.length
          : 0;
        onReviewStatsChange?.({ rating: avgRating, count: initialReviews.length });
      } else {
        loadData();
      }
      channel = setupRealtime();
    }
    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [productId, initialReviews]);

  useEffect(() => {
    if (user && productId) {
      checkPurchaseStatus();
    } else {
      setHasPurchased(false);
      setCheckingPurchase(false);
    }
  }, [user, productId]);

  const checkPurchaseStatus = async () => {
    setCheckingPurchase(true);
    try {
      // Check if user has an order for this product
      // We join order_items with orders to check the user_id
      const { data, error, count } = await supabase
        .from('order_items')
        .select('id, orders!inner(user_id, status)', { count: 'exact' })
        .eq('product_id', productId)
        .eq('orders.user_id', user.id);

      if (error) throw error;
      setHasPurchased((count ?? 0) > 0);
    } catch (err) {
      console.error("Error checking purchase status:", err);
      setHasPurchased(false);
    } finally {
      setCheckingPurchase(false);
    }
  };

  const setupRealtime = () => {
    const channel = supabase
      .channel(`product-reviews-${productId}-${Math.random().toString(36).substring(7)}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'reviews',
        filter: `product_id=eq.${productId}`
      }, async (payload) => {
        // Double check if we already have this review to avoid duplicates
        setReviews(prev => {
          if (prev.some(r => r.id === payload.new.id)) return prev;
          return prev; // We'll fetch the full data next
        });

        const { data } = await supabase
          .from("reviews")
          .select("*, profiles(name, avatar_url), review_likes(count), review_replies(*)")
          .eq("id", payload.new.id)
          .single();

        if (data) {
          setReviews(prev => {
            if (prev.some(r => r.id === data.id)) return prev;
            return [data, ...prev];
          });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'reviews',
        filter: `product_id=eq.${productId}`
      }, (payload) => {
        if (payload.new.status === 'spam' || payload.new.status === 'rejected') {
          setReviews(prev => prev.filter(r => r.id !== payload.new.id));
        } else {
          setReviews(prev => prev.map(r => r.id === payload.new.id ? { ...r, ...payload.new } : r));
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'reviews',
        filter: `product_id=eq.${productId}`
      }, (payload) => {
        setReviews(prev => prev.filter(r => r.id !== payload.old.id));
      })
      .subscribe();

    return channel;
  };

  const loadData = async () => {
    lastFetchedProductIdRef.current = productId;

    const { data: reviewsData, error: reviewsError } = await supabase
      .from("reviews")
      .select(`
        *, 
        profiles(name, avatar_url),
        review_likes(user_id),
        review_replies(*, profiles(name, avatar_url))
      `)
      .eq("product_id", productId)
      .or("status.neq.spam,status.is.null");

    let finalReviews = reviewsData || [];

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError);
      finalReviews = [];
    }

    setReviews(finalReviews);

    const avgRating = finalReviews.length > 0
      ? finalReviews.reduce((s, r) => s + r.rating, 0) / finalReviews.length
      : 0;

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

      // Manually refresh data to ensure immediate UI update
      loadData();

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
    <div className="mt-6 sm:mt-10 md:mt-12 lg:mt-14 w-full mx-auto max-w-[1120px] min-w-[300px]">
      <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
        <h1 className="font-poppins font-medium text-xl sm:text-2xl md:text-3xl lg:text-[32px] text-[#141718] tracking-tight">
          Customer Reviews
        </h1>

        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <ReviewSummary
            rating={reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0}
            count={reviews.length}
          />
        </div>
      </div>

      <div className="relative mb-8 sm:mb-10 md:mb-12">
        {user && hasPurchased && (
          reviews.some(r => r.user_id === user.id) ? (
            <div className="bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
              <p className="text-[#141718] font-medium text-sm sm:text-base mb-1">
                You have already reviewed this product.
              </p>
              <p className="text-gray-400 text-xs sm:text-sm">
                You can edit or delete your existing review in the list below.
              </p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-stretch md:items-center bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 transition-shadow hover:shadow-md w-full min-w-[300px]">

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={1}
                className="w-full md:flex-1 resize-none border-none text-sm sm:text-base focus:outline-none placeholder:text-gray-400 font-inter py-2"
              />

              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-end">

                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setRating(s)}>
                      <FaStar className={`text-lg sm:text-xl transition-colors ${rating >= s ? "text-[#141718]" : "text-gray-200"}`} />
                    </button>
                  ))}
                </div>

                <button
                  onClick={postReview}
                  disabled={!comment.trim()}
                  className="w-full sm:w-auto bg-[#141718] text-white px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all hover:bg-gray-800 disabled:opacity-30 disabled:grayscale"
                >
                  Write Review
                </button>
              </div>
            </div>
          )
        )}
        {!user && (
          <div className="hidden">
            {/* Guest logic removed as requested */}
          </div>
        )}
        {user && !hasPurchased && !checkingPurchase && (
          <div className="hidden">
            {/* Not purchased logic removed as requested - they will simply see reviews given by others */}
          </div>
        )}
      </div>

      {reviews.length > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#141718] tracking-tight">
            {reviews.length} Reviews
          </h2>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="w-full md:w-auto border border-gray-200 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold bg-white outline-none cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {reviews.length === 0 ? (
          <div className="py-10 mb-5 text-center bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
            <p className="text-gray-500 font-medium text-base sm:text-lg">No customer reviews yet</p>
          </div>
        ) : (
          displayed.slice(0, visible).map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              onDelete={(id: string) => setReviews(prev => prev.filter(r => r.id !== id))}
              onUpdate={(id: string, updates: any) =>
                setReviews(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
              }
            />
          ))
        )}
      </div>

      {visible < reviews.length && (
        <div className="text-center mt-8 sm:mt-10 md:mt-12 mb-12 sm:mb-14 md:mb-16">
          <button
            onClick={() => setVisible(v => v + 5)}
            className="border-2 border-[#141718] px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 rounded-full font-bold hover:bg-gray-50 transition-all text-[#141718] text-xs sm:text-sm"
          >
            Load more
          </button>
        </div>
      )}

      {modal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 max-w-xs sm:max-w-sm w-full text-center">
            <p className="mb-6 sm:mb-8 font-medium text-[#141718] text-sm sm:text-base">
              {modal.msg}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
