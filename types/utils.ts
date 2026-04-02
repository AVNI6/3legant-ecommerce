/**
 * COMPREHENSIVE TYPESCRIPT UTILITY TYPES
 *
 * These types help optimize the codebase by:
 * 1. Reducing data transferred between components
 * 2. Preventing unnecessary re-renders from prop changes
 * 3. Ensuring type safety throughout the application
 * 4. Enabling better tree-shaking and code splitting
 */

// ============================================================================
// PAGINATION & API RESPONSE UTILITIES
// ============================================================================

/**
 * Generic paginated response type for any data type
 * Used for admin pages, search results, and product listings
 * Reduces memory by only fetching relevant data per page
 */
export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
  totalPages: number
}

/**
 * API error response type for consistent error handling
 * Prevents cascading failures and provides user feedback
 */
export type ApiErrorResponse = {
  error: string
  code: string
  statusCode: number
  timestamp: string
}

/**
 * Success response wrapper for all API calls
 * Enables type-safe data extraction
 */
export type ApiSuccessResponse<T> = {
  data: T
  success: boolean
  timestamp: string
}

/**
 * Union type for any API response
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// ============================================================================
// ENTITY-SPECIFIC UTILITY TYPES
// ============================================================================

/**
 * Admin dashboard statistics - server-side aggregated
 * Reduces client-side computation and database load
 */
export type AdminDashboardStats = {
  totalRevenue: number
  ordersCount: number
  dailyRevenue: Array<{ date: string; revenue: number }>
  weeklyRevenue: Array<{ week: string; revenue: number }>
  monthlyRevenue: Array<{ month: string; revenue: number }>
  topProducts: Array<{
    id: number
    name: string
    sales: number
    revenue: number
  }>
  recentOrders: Array<{
    id: number
    userId: string
    totalPrice: number
    status: string
    createdAt: string
  }>
}

/**
 * Order listing for admin - minimal fields
 * Prevents fetching unnecessary data for table display
 */
export type AdminOrderRow = {
  id: number
  userId: string
  totalPrice: number
  status: string
  paymentStatus: string
  createdAt: string
}

/**
 * User profile for display only
 * Excludes sensitive fields like passwords, emails (when listing)
 */
export type PublicUserProfile = {
  id: string
  name: string
  avatar?: string
  role: 'admin' | 'customer'
  createdAt: string
}

/**
 * Product category statistics
 * Used for filter optimization
 */
export type CategoryStats = Record<string, {
  count: number
  totalSales: number
}>

/**
 * Price range statistics
 * Helps optimize filter queries
 */
export type PriceRangeStats = {
  min: number
  max: number
  averagePrice: number
  productsInRange: Record<string, number>
}

// ============================================================================
// STATUS & ENUM MAPPINGS (RECORD TYPE EXAMPLES)
// ============================================================================

/**
 * Order status display configuration
 * Type-safe status mapping with labels and colors
 */
export type OrderStatusDisplay = Record<
  'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled',
  {
    label: string
    color: string
    icon?: string
  }
>

/**
 * Payment status configurations
 */
export type PaymentStatusDisplay = Record<
  'pending' | 'success' | 'failed' | 'refund' | 'cancelled',
  {
    label: string
    color: string
    icon?: string
  }
>

/**
 * Refund status configurations
 */
export type RefundStatusDisplay = Record<
  'pending' | 'approved' | 'rejected' | 'processed',
  {
    label: string
    color: string
    action?: string
  }
>

// ============================================================================
// FILTERING & SEARCH UTILITIES
// ============================================================================

/**
 * Filter configuration for product search/listing
 * Enables reusable filtering logic
 */
export type FilterConfig = {
  category?: string
  priceRange?: {
    min: number
    max: number
  }
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'popular'
  page?: number
  limit?: number
  search?: string
}

/**
 * Faceted search results
 * Returns data + available filters for next query
 */
export type FacetedSearchResults<T> = {
  results: T[]
  facets: {
    categories: Array<{ name: string; count: number }>
    priceRanges: Array<{ min: number; max: number; count: number }>
  }
  total: number
  page: number
}

// ============================================================================
// CACHE & PERFORMANCE UTILITIES
// ============================================================================

/**
 * Cache metadata for data validation
 * Prevents stale data from being displayed
 */
export type CacheMetadata = {
  fetchedAt: number
  expiresAt: number
  isValid: boolean
}

/**
 * Cached response wrapper
 * Includes metadata for TTL validation
 */
export type CachedResponse<T> = {
  data: T
  metadata: CacheMetadata
}

/**
 * Prefetch hint for performance
 * Tells system which data to prefetch
 */
export type PrefetchHint = {
  resource: string
  priority: 'high' | 'medium' | 'low'
  retryOn?: 'stale' | 'error'
}

// ============================================================================
// FORM & VALIDATION UTILITIES
// ============================================================================

/**
 * Form field error mapping
 * Enables granular validation feedback
 */
export type FormErrors<T extends Record<string, any>> = Partial<
  Record<keyof T, string>
>

/**
 * Form submission state
 * Tracks loading, errors, and success
 */
export type FormState<T> = {
  isSubmitting: boolean
  isValid: boolean
  errors: FormErrors<T>
  touched: Partial<Record<keyof T, boolean>>
}

/**
 * Validation rule configuration
 */
export type ValidationRule = {
  pattern?: RegExp
  minLength?: number
  maxLength?: number
  required?: boolean
  custom?: (value: any) => boolean | string
}

/**
 * Validation schema for entire form
 */
export type ValidationSchema<T extends Record<string, any>> = Record<
  keyof T,
  ValidationRule
>

// ============================================================================
// QUERY & DATABASE UTILITIES
// ============================================================================

/**
 * Query builder configuration
 * Optimizes database queries
 */
export type QueryConfig = {
  select?: string[]
  where?: Record<string, any>
  orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>
  limit?: number
  offset?: number
  includeCount?: boolean
}

/**
 * Batch query operations
 * Prevents N+1 queries
 */
export type BatchQueryOp<T> = {
  table: string
  ids: (string | number)[]
  select?: string[]
}

/**
 * Data loader batch response
 */
export type BatchResponse<T> = Record<string | number, T>

// ============================================================================
// COMPONENT PROP UTILITIES (RECORD & OMIT EXAMPLES)
// ============================================================================

/**
 * Event handler types for consistent patterns
 */
export type EventHandlers = Record<
  'onClick' | 'onChange' | 'onSubmit' | 'onError',
  ((event: any) => void) | undefined
>

/**
 * Common component prop configurations
 */
export type ComponentProps = {
  className?: string
  style?: React.CSSProperties
  disabled?: boolean
  loading?: boolean
  error?: string
}

/**
 * Button variants - using Record for type-safe button types
 */
export type ButtonVariants = Record<
  'primary' | 'secondary' | 'danger' | 'outline',
  {
    bgColor: string
    textColor: string
    borderColor?: string
    hoverBgColor: string
  }
>

// ============================================================================
// HELPER FUNCTIONS & TYPE GUARDS
// ============================================================================

/**
 * Type guard for checking if response is an error
 */
export function isApiError(response: any): response is ApiErrorResponse {
  return 'error' in response && 'code' in response
}

/**
 * Type guard for paginated responses
 */
export function isPaginatedResponse<T>(
  response: any
): response is PaginatedResponse<T> {
  return (
    'data' in response &&
    'page' in response &&
    'pageSize' in response &&
    'hasMore' in response
  )
}

/**
 * Cache expiry checker
 */
export function isCacheValid(metadata: CacheMetadata): boolean {
  return metadata.isValid && Date.now() < metadata.expiresAt
}

/**
 * Create cache metadata with TTL
 */
export function createCacheMetadata(ttlMs: number): CacheMetadata {
  const fetchedAt = Date.now()
  return {
    fetchedAt,
    expiresAt: fetchedAt + ttlMs,
    isValid: true,
  }
}

/**
 * Merge pagination parameters
 */
export function createPaginationParams(
  page: number = 1,
  pageSize: number = 20
): { offset: number; limit: number } {
  return {
    offset: (page - 1) * pageSize,
    limit: pageSize,
  }
}

/**
 * Filter out undefined values from object
 */
export function compactObject<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  ) as Partial<T>
}

/**
 * Convert array to Record for O(1) lookups
 */
export function arrayToRecord<T extends { id: string | number }>(
  items: T[]
): Record<string | number, T> {
  return items.reduce((acc, item) => {
    acc[item.id] = item
    return acc
  }, {} as Record<string | number, T>)
}
