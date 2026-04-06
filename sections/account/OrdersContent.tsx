"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/constants/Data";
import Link from "next/link";
import { APP_ROUTE } from "@/constants/AppRoutes";
import { REFUND_REASONS, isWithinRefundWindow, getDaysRemainingForRefund } from "@/constants/RefundConfig";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { FiChevronDown, FiChevronRight, FiInfo } from "react-icons/fi";
import { setOrders, cancelOrder, submitRefund, cancelRefundRequest } from "@/store/slices/orderSlice";
import { addToCart } from "@/store/slices/cartSlice";
import { fetchProducts } from "@/store/slices/productSlice";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { DEFAULT_REFUND_WINDOW_DAYS } from "@/constants/RefundConfig";
import Pagination from "@/components/common/Pagination";
import Modal from "@/components/ui/Modal";
import { toast } from "react-toastify";
import ReviewTab from "./ReviewTab";

type OrderItem = {
  id: number;
  product_id: number;
  price: number;
  quantity: number;
  color: string;
  variant_id?: number;
};

type Order = {
  id: number;
  user_id: string;
  order_date: string;
  total_price: number;
  status: string;
  invoice_url?: string | null;
  invoice_sent_at?: string | null;
  refund_status?: string | null;
  refund_amount?: number | null;
  refund_reason?: string | null;
  discount_amount?: number | null;
  coupon_code?: string | null;
  items_snapshot?: any[] | { items: any[] | null, shipping_method?: string } | null;
  order_items: OrderItem[];
  shipping_address?: any;
  billing_address?: any;
  payment_method?: string;
  admin_note?: string | null;
};

interface Props {
  userId: string;
  currentPage: number;
  refundWindowDays: number;
}

export default function OrdersContent({ userId, currentPage, refundWindowDays }: Props) {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { orders: reduxOrders } = useAppSelector(state => state.orders);
  const { items: allProducts, initialized: productsInitialized, loading: productsLoading } = useAppSelector((state: any) => state.products);

  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [refundModal, setRefundModal] = useState<{ orderid: number | null; visible: boolean }>({ orderid: null, visible: false });

  // Ensure products are fetched for live stock/data synchronization
  useEffect(() => {
    if (!productsInitialized && !productsLoading) {
      dispatch(fetchProducts());
    }
  }, [productsInitialized, productsLoading, dispatch]);
  const [refundForm, setRefundForm] = useState({ reason: "", details: "", amount: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    type: "info" | "confirm";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info"
  });
  const [reviewModalState, setReviewModalState] = useState<{ isOpen: boolean; productId: number | null }>({
    isOpen: false,
    productId: null
  });

  // Fetch Orders on the client side
  useEffect(() => {
    const fetchData = async (signal: AbortSignal) => {
      setLoading(true);
      try {
        // Fetch Paginated Orders
        const PAGE_SIZE = 10;
        const from = (currentPage - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data: ordersData, error: ordersError, count } = await supabase
          .from("orders")
          .select(`
            id, user_id, total_price, status, order_date, shipping_address, 
            payment_method, billing_address, items_snapshot, invoice_url, 
            invoice_sent_at, refund_status, refund_amount, refund_reason, 
            discount_amount, coupon_code, admin_note,
            order_items ( id, product_id, price, quantity, color, variant_id )
          `, { count: 'exact' })
          .eq("user_id", userId)
          .order("order_date", { ascending: false })
          .range(from, to)
          .abortSignal(signal);

        if (ordersError) {
          const isAbort =
            ordersError.message?.includes('Fetch is aborted') ||
            ordersError.message?.includes('AbortError') ||
            signal.aborted;

          if (isAbort) return;
          throw ordersError;
        }

        dispatch(setOrders(ordersData as any[]));
        setTotalCount(count || 0);

      } catch (err: any) {
        // Suppress all forms of abort errors (standard DOMException or Supabase wrapped errors)
        const isAbort =
          err.name === 'AbortError' ||
          err.message?.includes('AbortError') ||
          err.message?.includes('Fetch is aborted') ||
          err.code === '20' || // Some environments use code 20 for abort
          signal.aborted;

        if (isAbort) return;

        console.error("Failed to fetch client-side order data:", err);
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    const controller = new AbortController();
    if (userId) {
      fetchData(controller.signal);
    }

    return () => {
      controller.abort();
    };
  }, [userId, currentPage, dispatch]);

  const orders = reduxOrders;
  const totalPages = Math.ceil(totalCount / 10);
  const page = currentPage;


  const toggleExpand = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const canRequestRefund = (order: Order): boolean => {
    const isDelivered = order.status === "delivered" || order.status === "shipped";
    const withinWindow = isWithinRefundWindow(order.order_date, refundWindowDays);
    const noExistingRefund = !order.refund_status || order.refund_status === "rejected";

    return isDelivered && withinWindow && noExistingRefund;
  };

  const canCancelOrder = (order: Order): boolean => {
    const cancellableStatuses = ["pending", "processing", "confirmed"];
    return cancellableStatuses.includes(order.status) && !order.refund_status;
  };

  const handleCancelOrder = async (orderId: number) => {
    setActionModal({
      isOpen: true,
      title: "Cancel Order",
      message: "Cancel this order? If payment was captured, refund will be initiated.",
      type: "confirm",
      onConfirm: async () => {
        setSubmitting(true);
        try {
          const order = orders.find((o) => o.id === orderId);
          const totalAmount = order?.total_price || 0;
          await dispatch(cancelOrder({ orderId, totalAmount, adminNote: "Customer cancelled the order before shipment" })).unwrap();
          toast.success("Order cancelled successfully.");
        } catch (err: any) {
          console.error("Order cancellation error:", err);
          toast.error("Error cancelling order: " + (err.message || "Please contact support."));
        } finally {
          setSubmitting(false);
          setActionModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleCancelRefund = async (orderId: number) => {
    setActionModal({
      isOpen: true,
      title: "Withdraw Refund Request",
      message: "Are you sure you want to cancel your refund request for this order?",
      type: "confirm",
      onConfirm: async () => {
        setSubmitting(true);
        try {
          await dispatch(cancelRefundRequest({ orderId })).unwrap();
          toast.success("Refund request withdrawn successfully.");
        } catch (err: any) {
          console.error("Refund withdrawal error:", err);
          toast.error("Error withdrawing request: " + (err.message || "Please contact support."));
        } finally {
          setSubmitting(false);
          setActionModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleRefundSubmit = async () => {
    if (!refundModal.orderid || !refundForm.reason) {
      toast.warning("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(submitRefund({ orderId: refundModal.orderid, reason: refundForm.reason + (refundForm.details ? ": " + refundForm.details : "") })).unwrap();

      toast.success("Refund request submitted successfully!");
      setRefundModal({ orderid: null, visible: false });
      setRefundForm({ reason: "", details: "", amount: 0 });
    } catch (err: any) {
      console.error("Refund submission error:", err);
      toast.error("Error submitting refund request: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getRefundStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: "bg-orange-100 text-orange-700 border-orange-200",
      approved: "bg-blue-100 text-blue-700 border-blue-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
      processed: "bg-green-100 text-green-700 border-green-200",
    };
    return colors[status.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700 ring-amber-600/20",
      processing: "bg-indigo-100 text-indigo-700 ring-indigo-600/20",
      confirmed: "bg-blue-100 text-blue-700 ring-blue-600/20",
      shipped: "bg-cyan-100 text-cyan-700 ring-cyan-600/20",
      delivered: "bg-green-100 text-green-700 ring-green-600/20",
      cancelled: "bg-red-100 text-red-700 ring-red-600/20",
    };
    return colors[status.toLowerCase()] || "bg-gray-100 text-gray-700 ring-gray-600/20";
  };

  if (loading) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        <p className="text-gray-400 font-medium animate-pulse text-sm">Fetching your orders...</p>
      </div>
    );
  }

  if (!orders || orders.length === 0)
    return (
      <div className="py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <h2 className="text-xl font-semibold mb-2">No Orders Found</h2>
        <p className="text-gray-500">You haven't placed any orders yet.</p>
        <Link href={APP_ROUTE.product} className="inline-block mt-4 bg-black text-white px-6 py-2 rounded-xl">
          Start Shopping
        </Link>
      </div>
    );

  return (
    <div className="w-full">
      <h2 className="font-inter font-semibold text-[20px] leading-[32px] tracking-normal mb-10">Order History</h2>

      {refundModal.visible && refundModal.orderid && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-in zoom-in duration-200">
            <h3 className="text-2xl font-bold mb-2">Request Refund</h3>
            <p className="text-gray-500 text-sm mb-6">Tell us why you'd like a refund for order #{refundModal.orderid}.</p>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Reason *</label>
                <select
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                  className="w-full border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black transition-all outline-none"
                >
                  <option value="">Select a reason</option>
                  {REFUND_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Additional Details</label>
                <textarea
                  value={refundForm.details}
                  onChange={(e) => setRefundForm({ ...refundForm, details: e.target.value })}
                  placeholder="Provide more context (optional)..."
                  className="w-full border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black transition-all outline-none h-28 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setRefundModal({ orderid: null, visible: false })}
                disabled={submitting}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRefundSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-black text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP TABLE HEADER */}
      <div className="hidden md:grid grid-cols-[1fr_2fr_1.5fr_1.2fr_1.5fr_1fr] text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-4 mb-2 px-4">
        <p>Order ID</p>
        <p>Date Placed</p>
        <p>Status</p>
        <p>Total Price</p>
        <p>Items</p>
        <p className="text-right">Actions</p>
      </div>

      {/* ORDERS LIST */}
      <div className="space-y-3">
        {orders.map((order) => {
          const isExpanded = expandedOrderId === order.id;
          const snapshot = order.items_snapshot as any;
          const itemsFromSnapshot = Array.isArray(snapshot) ? snapshot : (snapshot?.items || []);
          const itemsCount = itemsFromSnapshot.length || order.order_items?.length || 0;

          return (
            <div
              key={order.id}
              className={`bg-white border-b transition-all duration-300 ${isExpanded ? ' shadow-md' : 'hover:border-gray-300'}`}
            >
              {/* UNIFIED RESPONSIVE ROW */}
              <div
                onClick={() => toggleExpand(order.id)}
                className="flex flex-col md:grid md:grid-cols-[1fr_2fr_1.5fr_1.2fr_1.5fr_1fr] items-start md:items-center gap-2 md:gap-4 py-4 md:py-6 px-4 cursor-pointer group"
              >
                {/* ID and Mobile/Desktop Summary */}
                <div className="flex justify-between items-center w-full md:w-auto">
                  <p className="font-bold text-black text-base md:text-lg">#{order.id}</p>
                  <div className={`md:hidden p-1.5 rounded-full bg-gray-50 transition-transform ${isExpanded ? 'rotate-180 text-black' : 'text-gray-300'}`}>
                    <FiChevronDown className="w-4 h-4" />
                  </div>
                </div>

                {/* Date */}
                <p className="text-gray-400 md:text-gray-500 text-xs md:text-sm font-medium">
                  {formatDate(order.order_date)}
                </p>

                {/* Status - Responsive Badge */}
                <div className="flex md:block gap-2 items-center">
                  <span className={`text-[9px] md:text-[10px] font-bold uppercase py-0.5 md:py-1 px-2 md:px-2.5 rounded-full ring-1 ring-inset ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>

                  {/* Mobile-only Price summary next to status */}
                  <p className="md:hidden font-bold text-black text-sm">{formatCurrency(order.total_price)}</p>
                </div>

                {/* Total Price (Desktop Only) */}
                <p className="hidden md:block font-bold text-black text-base">{formatCurrency(order.total_price)}</p>

                {/* Items Thumbnails (Desktop Only) */}
                <div className="hidden md:flex gap-3 overflow-hidden">
                  {itemsFromSnapshot.slice(0, 3).map((item: any, idx: number) => (
                    <img
                      key={`img-${order.id}-${idx}`}
                      src={item.image || (item.product_variant?.color_images?.[0]) || item.products?.image}
                      alt="Product"
                      className="h-8 w-8 lg:h-10 lg:w-10 object-cover"
                    />
                  ))}
                  {itemsCount > 3 && (
                    <div className="flex items-center justify-center h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-gray-100 text-[10px] font-bold text-gray-500 ring-2 ring-white">
                      +{itemsCount - 3}
                    </div>
                  )}
                </div>

                {/* Desktop Chevron Action */}
                <div className="hidden md:flex justify-end pr-2">
                  <div className={`p-2 rounded-full transition-all duration-300 ${isExpanded
                    ? 'rotate-180 bg-black text-white'
                    : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-black'}`}>
                    <FiChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* EXPANDED CONTENT */}
              {isExpanded && (
                <div className="px-5 md:px-8 md:py-4 bg-white rounded-b-2xl animate-in slide-in-from-top-2 duration-300">
                  {/* Order Items Section */}
                  <div className="mb-6 pb-6 border-b border-gray-100">
                    <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Items ({itemsCount})</h4>
                    <div className="space-y-3">
                      {itemsFromSnapshot.map((item: any, idx: number) => (
                        <div key={`item-${order.id}-${idx}`} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-gray-50 p-4 rounded-xl border border-gray-100/50 hover:border-gray-200 transition-colors">
                          {/* Product Image & Core Info */}
                          <div className="flex gap-4 items-start flex-1 w-full min-w-0">
                            <img
                              src={item.image || item.color_image?.[0] || '/placeholder.png'}
                              alt={item.name || 'Product'}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0 shadow-sm"
                            />

                            <div className="flex-1 min-w-0 py-0.5">
                              <Link href={`${APP_ROUTE.product}/${item.product_id || item.id}?variantId=${item.variant_id || ''}`} className="hover:underline group">
                                <h5 className="font-bold text-sm sm:text-base text-black line-clamp-2 mb-1 group-hover:text-gray-600 transition-colors">
                                  {item.name || `Product #${item.product_id || item.id}`}
                                </h5>
                              </Link>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] sm:text-xs text-gray-500 mb-2">
                                <span>Color: <strong className="text-gray-700">{item.color || 'N/A'}</strong></span>
                                {item.size && <span>Size: <strong className="text-gray-700">{item.size}</strong></span>}
                                <span>Qty: <strong className="text-gray-700">{item.quantity}</strong></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-sm sm:text-base text-black">
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Amazon-style Actions Section */}
                          <div className="flex flex-col gap-2 w-full sm:w-auto pt-2 sm:pt-0">
                            {order.status.toLowerCase() === "delivered" && (
                              <button
                                onClick={() => setReviewModalState({ isOpen: true, productId: item.product_id || item.id })}
                                className="flex items-center justify-center gap-2 py-2 px-4 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-[0.98] w-full sm:min-w-[160px]"
                              >
                                <span>Write a product review</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                const targetVariantId = item.variant_id || item.id;
                                const liveProduct = allProducts.find((p: any) => Number(p.variant_id) === Number(targetVariantId));

                                // Cross-check stock: Use live data if available, else fallback to snapshot
                                const currentStock = liveProduct ? Number(liveProduct.stock) : Number(item.stock || 0);

                                if (currentStock <= 0) {
                                  toast.error("Sorry, this product is currently out of stock.");
                                  return;
                                }

                                dispatch(addToCart({
                                  userId: userId,
                                  item: {
                                    id: item.product_id || item.id,
                                    variant_id: targetVariantId,
                                    name: item.name || "Product",
                                    price: Number(item.price),
                                    image: item.image || item.color_image?.[0] || "",
                                    color: item.color || "Default",
                                    quantity: 1,
                                    stock: currentStock
                                  } as any
                                }));
                                toast.success("Added to cart");
                              }}
                              className="flex items-center justify-center gap-2 py-2 px-4 bg-gray-900 text-white rounded-lg text-[11px] font-bold hover:bg-black transition-all shadow-sm active:scale-[0.98] w-full sm:min-w-[160px]"
                            >
                              <span>Buy it again</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 md:gap-10">
                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">Shipping Details</h4>
                        <div className="space-y-0.5">
                          <p className="font-bold text-black text-base md:text-lg">
                            {order.shipping_address?.firstName} {order.shipping_address?.lastName}
                          </p>
                          <p className="text-gray-500 text-xs md:text-sm leading-relaxed max-w-sm">
                            {order.shipping_address?.street}, {order.shipping_address?.city},<br />
                            {order.shipping_address?.state} {order.shipping_address?.zip}, {order.shipping_address?.country}
                          </p>
                          {(order.shipping_address?.phone || snapshot?.shipping_method) && (
                            <div className="flex flex-col gap-1.5 pt-2">
                              {order.shipping_address?.phone && (
                                <p className="text-black font-bold text-xs">
                                  Phone: {order.shipping_address?.phone}
                                </p>
                              )}
                              {snapshot?.shipping_method && (
                                <p className="text-blue-600 font-bold text-xs uppercase tracking-tight">
                                  Method: {snapshot.shipping_method}
                                  {snapshot.shipping_cost !== undefined && (
                                    <span className="ml-1 text-gray-400 normal-case font-medium">
                                      ({Number(snapshot.shipping_cost) === 0 ? "Free" : formatCurrency(snapshot.shipping_cost)})
                                    </span>
                                  )}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wider">Paid via</span>
                        <span className="text-[9px] font-black text-black px-1.5 py-0.5 border border-black rounded uppercase italic">
                          {order.payment_method || 'Card'}
                        </span>
                      </div>
                    </div>

                    <div className="w-full md:w-64 flex flex-col gap-2.5">
                      <div className="flex flex-col gap-2.5">
                        {canCancelOrder(order) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleCancelOrder(order.id);
                            }}
                            disabled={submitting}
                            className="flex items-center justify-between border-2 border-red-100 text-red-600 bg-red-50/50 px-5 py-3 md:py-3.5 rounded-xl font-extrabold text-xs hover:bg-red-100 transition-all active:scale-[0.98] disabled:opacity-50"
                          >
                            <span>Cancel Order</span>
                            <span className="text-[9px] font-black opacity-60 italic">Pre-shipment</span>
                          </button>
                        )}

                        {canRequestRefund(order) ? (
                          <button
                            onClick={() => {
                              setRefundForm({ reason: "", details: "", amount: 0 });
                              setRefundModal({ orderid: order.id, visible: true });
                            }}
                            className="flex items-center justify-between border-2 border-orange-100 text-orange-600 bg-orange-50/50 px-5 py-3 md:py-3.5 rounded-xl font-extrabold text-xs hover:bg-orange-100 transition-all active:scale-[0.98]"
                          >
                            <span>Request Refund</span>
                            <span className="text-[9px] font-black opacity-60">
                              {getDaysRemainingForRefund(order.order_date, refundWindowDays)}D
                            </span>
                          </button>
                        ) : order.refund_status ? (
                          <div className="flex flex-col gap-2">
                            <div className={`flex items-center justify-between px-5 py-3 md:py-3.5 rounded-xl border text-[10px] font-black uppercase tracking-wider ${getRefundStatusColor(order.refund_status)}`}>
                              <span>
                                Refund {order.refund_status}
                                {order.refund_amount ? ` (${formatCurrency(order.refund_amount)})` : ""}
                              </span>
                              <FiInfo className="w-4 h-4" />
                            </div>

                            {order.refund_status === "pending" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleCancelRefund(order.id);
                                }}
                                disabled={submitting}
                                className="text-[10px] font-black text-gray-400 hover:text-black transition-colors uppercase tracking-widest text-center py-1"
                              >
                                Withdraw Request
                              </button>
                            )}

                            {order.admin_note && (
                              <p className="text-[9px] text-gray-400 italic px-2">
                                Note: {order.admin_note}
                              </p>
                            )}
                          </div>
                        ) : !canCancelOrder(order) ? (
                          <div className="text-center py-3.5 px-5 bg-gray-50 text-gray-300 rounded-xl text-[9px] font-black uppercase border border-gray-50 tracking-wider">
                            Order Locked
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* PAGINATION CONTROLS */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
      />

      <Modal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal(prev => ({ ...prev, isOpen: false }))}
        title={actionModal.title}
      >
        <div className="space-y-6">
          <p className="text-gray-600 font-medium leading-relaxed">{actionModal.message}</p>
          {actionModal.type === "confirm" && (
            <div className="flex gap-3 pt-4 justify-end">
              <button
                onClick={() => setActionModal(prev => ({ ...prev, isOpen: false }))}
                className="px-6 py-2.5 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all text-gray-500"
              >
                No, Keep it
              </button>
              <button
                onClick={actionModal.onConfirm}
                className="px-6 py-2.5 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg active:scale-95"
              >
                Yes, Proceed
              </button>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={reviewModalState.isOpen}
        onClose={() => setReviewModalState({ isOpen: false, productId: null })}
        title="Product Review"
      >
        <div className="max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
          {reviewModalState.productId && (
            <ReviewTab
              productId={reviewModalState.productId}
              onReviewStatsChange={(stats) => {
                // Background update if needed, normally not needed for orders page
              }}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
