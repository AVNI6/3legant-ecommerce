"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { formatCurrency } from "@/constants/Data";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveStep, clearCartItems } from "@/store/slices/cartSlice";
import { CompleteOrderSkeleton } from "@/components/ui/skeleton";

interface OrderItem {
  id: number;
  product_id: number;
  price: number;
  quantity: number;
  color: string;
  products: {
    id: number;
    name: string;
    image: string;
  };
}

interface Order {
  id: number;
  user_id: string;
  total_price: number;
  status: string;
  refund_status?: string | null;
  order_date: string;
  shipping_address: any;
  payment_method: string;
  invoice_url?: string | null;
  invoice_sent_at?: string | null;
  items_snapshot?: any; // Can be stringified JSON or Object
  order_items: OrderItem[];
}

interface PaymentInfo {
  order_id: number | null;
  status: string;
  method?: string | null;
}

export default function CompleteOrder() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const requestedInvoiceForOrder = useRef<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const sessionId = searchParams.get("session_id");
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector(state => state.cart.activeStep);

  const [isMounted, setIsMounted] = useState(false);
  const lastFetchedOrderRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only dispatch if we aren't already on step 3 to avoid re-render loops
    if (currentStep !== 3) {
      dispatch(setActiveStep(3));
      dispatch(clearCartItems()); // 🧺 Clear cart state + guest storage
    }

    if (lastFetchedOrderRef.current) return;
    lastFetchedOrderRef.current = true;

    const fetchLatestOrder = async () => {
      setLoading(true);
      setPaymentInfo(null);

      const { data: authData, error: sessionError } = await supabase.auth.getUser();
      const user = authData?.user;

      if (sessionError || !user) {
        console.error("User not logged in");
        setLoading(false);
        return;
      }

      const fetchOrderById = async (id: number) => {
        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            order_items (
              id,
              product_id,
              price,
              quantity,
              color,
              products (id, name, image)
            )
          `)
          .eq("user_id", user.id)
          .eq("id", id)
          .single();

        return { data, error };
      };

      const fetchLatestPaymentWithOrder = async () => {
        const { data, error } = await supabase
          .from("payments")
          .select("order_id, status, method")
          .eq("user_id", user.id)
          .not("order_id", "is", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        return { data, error };
      };

      // 1) Strongest source: explicit orderId in URL
      if (orderId) {
        const { data, error } = await fetchOrderById(Number(orderId));

        if (error) {
          console.error("Failed to fetch order by id:", error.message);
          setOrder(null);
        } else {
          setOrder(data as Order);
        }

        setLoading(false);
        return;
      }

      // 2) Success redirect source: lookup exact order from session_id -> payments.order_id
      if (sessionId) {
        const { data: payment, error: paymentError } = await supabase
          .from("payments")
          .select("order_id, user_id, status, method")
          .eq("payment_id", sessionId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (!paymentError && payment) {
          setPaymentInfo({
            order_id: payment.order_id ?? null,
            status: payment.status,
            method: payment.method,
          });
        }

        if (!paymentError && payment?.order_id) {
          const { data, error } = await fetchOrderById(Number(payment.order_id));

          if (!error && data) {
            setOrder(data as Order);
            setLoading(false);
            return;
          }
        }

        // Webhook hasn't processed yet or is in-progress — poll Supabase directly as a fallback
        if (!paymentError && payment && !payment.order_id) {
          try {

            // Poll for up to 10 seconds (5 attempts, every 2 seconds)
            for (let i = 0; i < 5; i++) {
              await new Promise(r => setTimeout(r, 2000));

              const { data: retryPayment } = await supabase
                .from("payments")
                .select("order_id, status, method")
                .eq("payment_id", sessionId)
                .maybeSingle();

              if (retryPayment?.order_id) {
                setPaymentInfo({
                  order_id: retryPayment.order_id,
                  status: retryPayment.status || "success",
                  method: retryPayment.method,
                });

                const { data, error } = await fetchOrderById(Number(retryPayment.order_id));
                if (!error && data) {
                  setOrder(data as Order);
                  setLoading(false);
                  return;
                }
                break;
              }
            }
          } catch (pollingErr) {
            console.warn("[COMPLETE-ORDER] Polling fallback failed:", pollingErr);
          }
        }


        // Single-pass fallback through payments table to keep order/payment linkage from Supabase.
        const { data: latestPaymentWithOrder } = await fetchLatestPaymentWithOrder();
        if (latestPaymentWithOrder?.order_id) {
          setPaymentInfo({
            order_id: latestPaymentWithOrder.order_id,
            status: latestPaymentWithOrder.status,
            method: latestPaymentWithOrder.method,
          });

          const { data, error } = await fetchOrderById(Number(latestPaymentWithOrder.order_id));
          if (!error && data) {
            setOrder(data as Order);
            setLoading(false);
            return;
          }
        }
      }

      // 3) Fallback only when opening complete page without checkout context
      let query = supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            product_id,
            price,
            quantity,
            color,
            products (id, name, image)
          )
        `)
        .eq("user_id", user.id)

      query = query.order("order_date", { ascending: false }).limit(1)

      const { data, error } = await query.single();

      if (error) {
        console.error("Failed to fetch order:", error.message);
        setOrder(null);
      } else {
        setOrder(data as Order);

        // If payment info is still missing, resolve payment status for this order from Supabase.
        if (data?.id) {
          const { data: orderPayment } = await supabase
            .from("payments")
            .select("order_id, status, method")
            .eq("user_id", user.id)
            .eq("order_id", data.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (orderPayment) {
            setPaymentInfo({
              order_id: orderPayment.order_id,
              status: orderPayment.status,
              method: orderPayment.method,
            });
          }
        }
      }

      setLoading(false);
    };

    fetchLatestOrder();
  }, [orderId, sessionId, dispatch, currentStep]);

  useEffect(() => {
    if (!order?.id) return;

    // Prevent duplicate requests while user stays on this page.
    if (requestedInvoiceForOrder.current === order.id) return;

    // Skip if invoice is already generated and marked sent.
    if (order.invoice_url && order.invoice_sent_at) return;

    requestedInvoiceForOrder.current = order.id;

    void fetch(`/api/orders/${order.id}/generate-invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          const details = await response.text();
          console.warn("CompleteOrder invoice trigger failed:", details);
          return;
        }

        const payload = (await response.json()) as { invoice_url?: string };
        if (payload.invoice_url) {
          setOrder((prev) =>
            prev
              ? {
                ...prev,
                invoice_url: payload.invoice_url,
                invoice_sent_at: new Date().toISOString(),
              }
              : prev
          );
        }
      })
      .catch((error) => {
        console.warn("CompleteOrder invoice trigger error:", error);
      });
  }, [order?.id, order?.invoice_url, order?.invoice_sent_at]);

  if (loading) {
    return <CompleteOrderSkeleton />;
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p>No recent order found!</p>
      </div>
    );
  }

  // Safely parse items_snapshot (Support both legacy array and new structured object)
  let itemsToDisplay = [];
  try {
    const rawSnapshot = order.items_snapshot as any;
    if (Array.isArray(rawSnapshot)) {
      itemsToDisplay = rawSnapshot;
    } else if (rawSnapshot && typeof rawSnapshot === "object" && Array.isArray(rawSnapshot.items)) {
      itemsToDisplay = rawSnapshot.items;
    } else if (typeof rawSnapshot === "string") {
      const parsed = JSON.parse(rawSnapshot);
      itemsToDisplay = Array.isArray(parsed) ? parsed : (parsed.items || []);
    } else {
      itemsToDisplay = order.order_items || [];
    }
  } catch (e) {
    itemsToDisplay = order.order_items || [];
  }

  return (
    <div className="max-w-xl mx-auto text-center my-10 min-[375px]:my-20 px-3 min-[375px]:px-4">
      <h1 className="text-green-600 text-[16px] min-[375px]:text-xl sm:text-2xl mb-1 min-[375px]:mb-2">Thank you</h1>

      <h2 className="text-xl min-[375px]:text-3xl sm:text-4xl font-semibold mb-4 min-[375px]:mb-6">Order Received</h2>

      <div className="flex gap-3 min-[375px]:gap-4 sm:gap-10 my-6 min-[375px]:my-10 justify-center flex-wrap px-2">
        {Array.isArray(itemsToDisplay) && itemsToDisplay.map((item: any) => {
          // Unify the data structure between snapshot and joined order_items
          const name = item.name || item.products?.name;
          const image = item.image || item.products?.image;
          const quantity = item.quantity;
          const id = item.variant_id || item.id;

          return (
            <div key={id} className="relative inline-block transition-transform hover:scale-105 bg-[#F3F5F7] rounded overflow-visible">
              <img
                src={image}
                alt={name}
                className="w-14 h-14 min-[375px]:w-16 min-[375px]:h-16 sm:w-20 sm:h-20 object-contain shadow-sm mix-blend-multiply"
              />
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-black text-white text-[9px] min-[375px]:text-[10px] sm:text-xs font-semibold w-4 h-4 min-[375px]:w-5 min-[375px]:h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full shadow-md leading-none pb-[1px] z-10">
                {quantity}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[10px] min-[375px]:text-sm sm:text-base text-gray-600 space-y-1.5 min-[375px]:space-y-2 mb-6 min-[375px]:mb-8">
        <p>
          <span className="font-medium">Order Code:</span> #{order.id}
        </p>

        <p>
          <span className="font-medium">Date:</span>{" "}
          {new Date(order.order_date).toLocaleDateString()}
        </p>

        <p>
          <span className="font-medium">Total:</span>{" "}
          {formatCurrency(order.total_price)}
        </p>

        <p>
          <span className="font-medium">Status:</span> {order.status}
        </p>

        <p>
          <span className="font-medium">Payment Status:</span> {paymentInfo?.status || "unknown"}
        </p>
      </div>

      <button
        onClick={() => router.push("/pages/account/order")}
        className="bg-black text-white px-6 min-[375px]:px-10 py-3 min-[375px]:py-4 rounded-md min-[375px]:rounded-lg text-[10px] min-[375px]:text-base font-semibold hover:opacity-90 transition shadow-sm"
      >
        Purchase History
      </button>
    </div>
  );
}