"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/constants/Data";
import Link from "next/link";
import { APP_ROUTE } from "@/constants/AppRoutes";
import { REFUND_REASONS, isWithinRefundWindow, getDaysRemainingForRefund } from "@/constants/RefundConfig";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { FiChevronDown, FiChevronRight, FiDownload, FiInfo } from "react-icons/fi";
import { setOrders, cancelOrder, submitRefund } from "@/store/slices/orderSlice";
import { usePagination } from "@/lib/hooks/usePagination";

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
  items_snapshot?: any[] | null;
  order_items: OrderItem[];
  shipping_address?: any;
  billing_address?: any;
  payment_method?: string;
  admin_note?: string | null;
};

interface Props {
  initialOrders: Order[];
  refundWindowDays: number;
}

export default function OrdersContent({ initialOrders, refundWindowDays }: Props) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { orders: reduxOrders } = useAppSelector(state => state.orders);

  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [refundModal, setRefundModal] = useState<{ orderid: number | null; visible: boolean }>({ orderid: null, visible: false });
  const [refundForm, setRefundForm] = useState({ reason: "", details: "", amount: 0 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialOrders) {
      dispatch(setOrders(initialOrders as any[]));
    }
  }, [dispatch, initialOrders]);

  const orders = reduxOrders.length > 0 ? reduxOrders : (initialOrders || []);

  const {
    page,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
  } = usePagination(orders.length, { pageSize: 5 });

  const paginatedOrders = orders.slice((page - 1) * 5, page * 5);

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
    if (!confirm("Cancel this order? If payment was captured, refund will be initiated.")) {
      return;
    }

    setSubmitting(true);
    try {
      const order = orders.find((o) => o.id === orderId);
      const totalAmount = order?.total_price || 0;

      await dispatch(cancelOrder({ orderId, totalAmount, adminNote: "Customer cancelled the order before shipment" })).unwrap();

      alert("Order cancelled successfully.");
    } catch (err: any) {
      console.error("Order cancellation error:", err);
      alert("Error cancelling order: " + (err.message || "Please contact support."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefundSubmit = async () => {
    if (!refundModal.orderid || !refundForm.reason) {
      alert("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(submitRefund({ orderId: refundModal.orderid, reason: refundForm.reason + (refundForm.details ? ": " + refundForm.details : "") })).unwrap();

      alert("Refund request submitted successfully!");
      setRefundModal({ orderid: null, visible: false });
      setRefundForm({ reason: "", details: "", amount: 0 });
    } catch (err: any) {
      console.error("Refund submission error:", err);
      alert("Error submitting refund request: " + err.message);
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
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

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
        {paginatedOrders.map((order) => {
          const isExpanded = expandedOrderId === order.id;
          const itemsCount = (order.items_snapshot?.length || order.order_items?.length || 0);

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
                  <span className={`text-[9px] md:text-[10px] font-bold uppercase py-0.5 md:py-1 px-2 md:px-2.5 rounded-full ring-1 ring-inset ${order.status === 'delivered' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                    order.status === 'confirmed' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                      'bg-gray-50 text-gray-700 ring-gray-600/20'
                    }`}>
                    {order.status}
                  </span>

                  {/* Mobile-only Price summary next to status */}
                  <p className="md:hidden font-bold text-black text-sm">{formatCurrency(order.total_price)}</p>
                </div>

                {/* Total Price (Desktop Only) */}
                <p className="hidden md:block font-bold text-black text-base">{formatCurrency(order.total_price)}</p>

                {/* Items Thumbnails (Desktop Only) */}
                <div className="hidden md:flex gap-3 overflow-hidden">
                  {(order.items_snapshot || order.order_items || []).slice(0, 3).map((item: any, idx) => (
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
                      {(order.items_snapshot || order.order_items || []).map((item: any, idx: number) => (
                        <div key={`item-${order.id}-${idx}`} className="flex gap-4 items-start bg-gray-50 p-3 rounded-lg">
                          {/* Product Image */}
                          <img
                            src={item.image || item.color_image?.[0] || '/placeholder.png'}
                            alt={item.name || 'Product'}
                            className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                          />

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-sm text-black line-clamp-2 mb-1">
                              {item.name || `Product #${item.product_id}`}
                            </h5>
                            <div className="flex gap-3 text-xs text-gray-600 mb-2">
                              <span>Color: <strong>{item.color || 'N/A'}</strong></span>
                              {item.size && <span>Size: <strong>{item.size}</strong></span>}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Qty: <strong>{item.quantity}</strong>
                              </span>
                              <span className="font-bold text-sm text-black">
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                            </div>
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
                          {order.shipping_address?.phone && (
                            <p className="text-black font-bold text-xs pt-1.5">
                              {order.shipping_address?.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wider">Paid via</span>
                        <span className="text-[9px] font-black text-black px-1.5 py-0.5 border border-black rounded uppercase italic">
                          {order.payment_method || 'Card'}
                        </span>
                      </div>
                      {/* 
                      {order.discount_amount && (
                        <div className="pt-2">
                          <p className="text-[9px] font-bold text-green-600">
                            Discount Applied: {formatCurrency(order.discount_amount)}
                            {order.coupon_code && <span className="ml-1 text-gray-500">(Code: {order.coupon_code})</span>}
                          </p>
                        </div>
                      )} */}
                    </div>

                    <div className="w-full md:w-64 flex flex-col gap-2.5">
                      <div className="flex flex-col gap-2.5">
                        {/* 
                        {order.invoice_url ? (
                          <a
                            href={order.invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between bg-black text-white px-5 py-3 md:py-3.5 rounded-xl font-extrabold text-xs hover:opacity-90 active:scale-[0.98] transition-all group"
                          >
                            <span>Download Invoice</span>
                            <FiDownload className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                          </a>
                        ) : (
                          <div className="text-center py-3.5 px-5 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black border border-gray-100 uppercase tracking-tighter italic">
                            Invoice processing...
                          </div>
                        )}
                        */}

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
                          <div className={`flex items-center justify-between px-5 py-3 md:py-3.5 rounded-xl border text-[10px] font-black uppercase tracking-wider ${getRefundStatusColor(order.refund_status)}`}>
                            <span>Refund {order.refund_status}</span>
                            <FiInfo className="w-4 h-4" />
                          </div>
                        ) : !canCancelOrder(order) ? (
                          <div className="text-center py-3.5 px-5 bg-gray-50 text-gray-300 rounded-xl text-[9px] font-black uppercase border border-gray-50 tracking-wider">
                            Order Locked
                          </div>
                        ) : null}
                      </div>

                      {/* 
                      {order.invoice_sent_at && (
                        <div className="flex items-center gap-2 justify-center pt-1.5">
                          <div className="h-px flex-1 bg-gray-100"></div>
                          <p className="text-[8px] text-gray-300 font-black uppercase tracking-widest whitespace-nowrap">
                            Sent {formatDate(order.invoice_sent_at)}
                          </p>
                          <div className="h-px flex-1 bg-gray-100"></div>
                        </div>
                      )}
                      */}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Showing Page <span className="text-black">{page}</span> of <span className="text-black">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={previousPage}
              disabled={!hasPreviousPage}
              className="p-2.5 rounded-xl border border-gray-200 text-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all active:scale-95"
            >
              <FiChevronRight className="w-5 h-5 rotate-180" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`min-w-[40px] h-10 rounded-xl text-xs font-black transition-all active:scale-95 ${page === pageNum
                    ? "bg-black text-white shadow-lg"
                    : "text-gray-400 hover:text-black hover:bg-gray-50"
                    }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={nextPage}
              disabled={!hasNextPage}
              className="p-2.5 rounded-xl border border-gray-200 text-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all active:scale-95"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
