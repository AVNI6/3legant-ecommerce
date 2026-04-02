// Default refund window fallback value
export const DEFAULT_REFUND_WINDOW_DAYS = 15;

// Refund reason options available to customers
export const REFUND_REASONS = [
  { value: 'item_damaged', label: 'Item Damaged' },
  { value: 'wrong_item', label: 'Wrong Item' },
  { value: 'not_as_described', label: 'Not as Described' },
  { value: 'changed_mind', label: 'Changed Mind' },
  { value: 'other', label: 'Other' },
] as const;

// In-memory cache for refund window (refresh on page load)
let refundWindowCache: number | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch refund window days from database (with local cache)
 * @returns Promise<number> - days customers have to request refund
 */
export const getRefundWindowDays = async (): Promise<number> => {
  const now = Date.now();

  // Return cached value if still fresh
  if (refundWindowCache !== null && (now - cacheTimestamp) < CACHE_DURATION) {
    return refundWindowCache;
  }

  if (typeof window === 'undefined') {
    return DEFAULT_REFUND_WINDOW_DAYS;
  }

  try {
    const response = await fetch('/api/admin/refund-settings', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.warn('Failed to fetch refund window, using default');
      return DEFAULT_REFUND_WINDOW_DAYS;
    }

    const data = await response.json();
    const days = parseInt(data.refund_window_days, 10);

    // Cache the value
    if (!isNaN(days)) {
      refundWindowCache = days;
      cacheTimestamp = now;
      return days;
    }

    return DEFAULT_REFUND_WINDOW_DAYS;
  } catch (error) {
    console.warn('Failed to fetch refund window:', error);
    return DEFAULT_REFUND_WINDOW_DAYS;
  }
};

/**
 * Clear the cache to force fresh fetch
 */
export const clearRefundWindowCache = (): void => {
  refundWindowCache = null;
  cacheTimestamp = 0;
};

/**
 * Check if an order is within the refund window
 * @param orderDate Date when order was created
 * @param windowDays Optional override (if not provided, uses default)
 * @returns boolean - true if within refund window, false otherwise
 */
export const isWithinRefundWindow = (orderDate: string | Date, windowDays?: number): boolean => {
  const days = windowDays !== undefined ? windowDays : DEFAULT_REFUND_WINDOW_DAYS;
  
  let dateStr = orderDate;
  if (typeof dateStr === "string" && !dateStr.includes("Z") && !dateStr.includes("+")) {
    dateStr = dateStr + "Z";
  }
  
  const orderTime = new Date(dateStr).getTime();
  const nowTime = Date.now();
  const daysDiff = (nowTime - orderTime) / (1000 * 60 * 60 * 24);
  return daysDiff <= days;
};

export const getDaysRemainingForRefund = (orderDate: string | Date, windowDays?: number): number => {
  const days = windowDays !== undefined ? windowDays : DEFAULT_REFUND_WINDOW_DAYS;
  
  let dateStr = orderDate;
  if (typeof dateStr === "string" && !dateStr.includes("Z") && !dateStr.includes("+")) {
    dateStr = dateStr + "Z";
  }
  
  const orderTime = new Date(dateStr).getTime();
  const nowTime = Date.now();
  const daysDiff = (nowTime - orderTime) / (1000 * 60 * 60 * 24);
  
  // Use Math.ceil to be more generous (e.g., 6.1 days left shows as 7 days left)
  // or Math.floor for strictness. User said "6 days left" for a 1-day old order with 7-day window.
  // 7 - 1 = 6. So Math.floor is correct for their expectation.
  return Math.max(0, days - Math.floor(daysDiff));
};
