export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
  totalPages: number
}

export type ApiErrorResponse = {
  error: string
  code: string
  statusCode: number
  timestamp: string
}

export type ApiSuccessResponse<T> = {
  data: T
  success: boolean
  timestamp: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

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

export type AdminOrderRow = {
  id: number
  userId: string
  totalPrice: number
  status: string
  paymentStatus: string
  createdAt: string
}

export type PublicUserProfile = {
  id: string
  name: string
  avatar?: string
  role: 'admin' | 'customer'
  createdAt: string
}

export type CategoryStats = Record<string, {
  count: number
  totalSales: number
}>

export type PriceRangeStats = {
  min: number
  max: number
  averagePrice: number
  productsInRange: Record<string, number>
}

export type OrderStatusDisplay = Record<
  'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled',
  {
    label: string
    color: string
    icon?: string
  }
>

export type PaymentStatusDisplay = Record<
  'pending' | 'success' | 'failed' | 'refund' | 'cancelled',
  {
    label: string
    color: string
    icon?: string
  }
>

export type RefundStatusDisplay = Record<
  'pending' | 'approved' | 'rejected' | 'processed',
  {
    label: string
    color: string
    action?: string
  }
>

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
export type FacetedSearchResults<T> = {
  results: T[]
  facets: {
    categories: Array<{ name: string; count: number }>
    priceRanges: Array<{ min: number; max: number; count: number }>
  }
  total: number
  page: number
}

export type CacheMetadata = {
  fetchedAt: number
  expiresAt: number
  isValid: boolean
}

export type CachedResponse<T> = {
  data: T
  metadata: CacheMetadata
}

export type PrefetchHint = {
  resource: string
  priority: 'high' | 'medium' | 'low'
  retryOn?: 'stale' | 'error'
}

export type FormErrors<T extends Record<string, any>> = Partial<
  Record<keyof T, string>
>

export type FormState<T extends Record<string, any>> = {
  isSubmitting: boolean
  isValid: boolean
  errors: FormErrors<T>
  touched: Partial<Record<keyof T, boolean>>
}

export type ValidationRule = {
  pattern?: RegExp
  minLength?: number
  maxLength?: number
  required?: boolean
  custom?: (value: any) => boolean | string
}


export type ValidationSchema<T extends Record<string, any>> = Record<
  keyof T,
  ValidationRule
>

export type QueryConfig = {
  select?: string[]
  where?: Record<string, any>
  orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>
  limit?: number
  offset?: number
  includeCount?: boolean
}


export type BatchQueryOp<T extends Record<string, any>> = {
  table: string
  ids: (string | number)[]
  select?: string[]
}

export type BatchResponse<T> = Record<string | number, T>

export type EventHandlers = Record<
  'onClick' | 'onChange' | 'onSubmit' | 'onError',
  ((event: any) => void) | undefined
>

export type ComponentProps = {
  className?: string
  style?: React.CSSProperties
  disabled?: boolean
  loading?: boolean
  error?: string
}

export type ButtonVariants = Record<
  'primary' | 'secondary' | 'danger' | 'outline',
  {
    bgColor: string
    textColor: string
    borderColor?: string
    hoverBgColor: string
  }
>

export function isApiError(response: any): response is ApiErrorResponse {
  return 'error' in response && 'code' in response
}

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

export function isCacheValid(metadata: CacheMetadata): boolean {
  return metadata.isValid && Date.now() < metadata.expiresAt
}
export function createCacheMetadata(ttlMs: number): CacheMetadata {
  const fetchedAt = Date.now()
  return {
    fetchedAt,
    expiresAt: fetchedAt + ttlMs,
    isValid: true,
  }
}

export function createPaginationParams(
  page: number = 1,
  pageSize: number = 20
): { offset: number; limit: number } {
  return {
    offset: (page - 1) * pageSize,
    limit: pageSize,
  }
}

export function compactObject<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  ) as Partial<T>
}

export function arrayToRecord<T extends { id: string | number }>(
  items: T[]
): Record<string | number, T> {
  return items.reduce((acc, item) => {
    acc[item.id] = item
    return acc
  }, {} as Record<string | number, T>)
}
