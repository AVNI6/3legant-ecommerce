export interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
  rating: number
  variants: ProductVariant[]
  created_at: string
  views: number
}

export interface ProductVariant {
  id: number
  product_id: number
  color: string
  size: string
  stock: number
  price_modifier: number
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'customer'
  avatar?: string
  phone?: string
  created_at: string
  is_blocked: boolean
  last_activity?: string
}

export interface Order {
  id: number
  user_id: string
  order_date: string
  total_price: number
  status: OrderStatusType
  payment_status: PaymentStatusType
  shipping_address: Address
  billing_address: Address
  items_snapshot: CartSnapshotItem[]
  invoice_url?: string
  refund_status?: RefundStatus
  refund_amount?: number
  refund_reason?: string
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  price: number
  color: string
  size?: string
}

export interface Address {
  firstName: string
  lastName: string
  phone: string
  street: string
  city: string
  state: string
  zip: string
  country: string
}

export interface Review {
  id: number
  user_id: string
  product_id: number
  rating: number
  comment: string
  created_at: string
  status: 'pending' | 'approved' | 'rejected' | 'spam'
  user?: Pick<User, 'id' | 'name' | 'avatar'>
}

export interface Banner {
  id: number
  title: string
  subtitle?: string
  image_url: string
  link_url?: string
  position: number
  is_active: boolean
  created_at: string
}

export interface Blog {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string
  cover_image?: string
  author_id: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

export interface RefundRequest {
  id: number
  order_id: number
  user_id: string
  amount: number
  reason: string
  status: RefundStatus
  admin_note?: string
  created_at: string
  processed_at?: string
}

// ============================================================================
// EXPORT ALL TYPES FROM MODULES
// ============================================================================

// Export API types
export * from './api';

// Export Form types  
export * from './forms';

// Export UI types
export * from './ui';

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export type OrderStatusType = 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatusType = 'pending' | 'success' | 'failed' | 'refund' | 'cancelled'
export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'processed'

// ============================================================================
// UTILITY TYPES WITH EXAMPLES
// ============================================================================

/**
 * 1. PRODUCT CARD - Using Pick to select only display fields
 * Why: Product cards don't need all product data (description, variants, etc.)
 * This reduces memory and prevents passing unnecessary data to components
 */
export type ProductCardProps = Pick<Product, 'id' | 'name' | 'price' | 'image' | 'rating' | 'stock'>

// Example usage in component:
// const ProductCard: React.FC<ProductCardProps> = ({ id, name, price, image, rating }) => {...}

/**
 * 2. PRODUCT UPDATE API - Using Partial for optional field updates
 * Why: When updating a product, only changed fields should be sent
 * This is the standard pattern for PATCH/PUT requests
 */
export type ProductUpdatePayload = Partial<Omit<Product, 'id' | 'created_at'>>

// Example API function:
// async function updateProduct(id: number, data: ProductUpdatePayload): Promise<Product>

/**
 * 3. ADMIN PRODUCTS TABLE - Using Omit to hide internal fields
 * Why: Admin doesn't need to see all product fields in table view
 * Removes implementation details like created_at, views
 */
export type AdminProductRow = Omit<Product, 'description' | 'variants' | 'created_at'>

// Example in table rendering:
// const columns: (keyof AdminProductRow)[] = ['id', 'name', 'price', 'stock', 'category', 'rating']

/**
 * 4. PRODUCT STOCK MAPPING - Using Record for inventory tracking
 * Why: Quick lookup of stock by variant ID or product ID
 * Record provides type-safe key-value mapping
 */
export type StockMap = Record<string, number>  // variantId -> quantity
export type ProductStockMap = Record<number, StockMap>  // productId -> variantStocks

// Example usage:
// const inventory: ProductStockMap = { 1: { 'red-S': 10, 'red-M': 5 }, 2: { 'blue-L': 3 } }

/**
 * 5. LOGIN / SIGNUP FORMS - Using Pick for form field definitions
 * Why: Forms only need specific fields from User type
 * Ensures form state matches database schema
 */
export type LoginFormFields = Pick<User, 'email'> & { password: string }
export type SignupFormFields = Pick<User, 'email' | 'name'> & { password: string; confirmPassword: string }

// Example form validation:
// const validateLogin = (data: LoginFormFields): boolean => !!data.email && !!data.password

/**
 * 6. AUTH SESSION - Extracting auth.id from user type
 * Why: Session objects typically contain minimal user data
 * Using Pick ensures type safety between auth provider and app
 */
export type AuthSession = {
  user: Pick<User, 'id' | 'email' | 'name' | 'role'> | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Example hook usage:
// const { user } = useAuth() // user?.id is typed as string

/**
 * 7. CART ITEM TYPE - Combining product data with quantity
 * Why: Cart needs product info plus quantity and selected variant
 * Intersection type (&) combines ProductCardProps with cart-specific fields
 */
export type CartSnapshotItem = Pick<Product, 'id' | 'name' | 'price' | 'image'> & {
  quantity: number
  color: string
  size?: string
  variant_id?: number
}

export type CartItem = ProductCardProps & {
  quantity: number
  variant_id: number
  color: string
  size?: string
}

// Example cart total calculation:
// const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

/**
 * 8. ORDER CREATION - Required fields for checkout
 * Why: Ensure all necessary data is present before creating order
 * Required<Pick<...>> forces all selected fields to be non-optional
 */
export type CreateOrderPayload = Required<Pick<Order, 'user_id' | 'total_price' | 'shipping_address'>> & {
  items: Array<Pick<OrderItem, 'product_id' | 'quantity' | 'price' | 'color'>>
  payment_intent_id?: string
  coupon_code?: string
}

// Example order creation:
// const payload: CreateOrderPayload = { user_id: 'abc', total_price: 100, shipping_address: {...}, items: [...] }

/**
 * 9. REFUND REQUEST - Form fields for user submission
 * Why: Users submit limited info, server adds the rest
 */
export type RefundRequestPayload = Pick<RefundRequest, 'order_id' | 'reason'> & {
  requested_amount: number
}

/**
 * 10. ADMIN REFUND ACTION - Admin can adjust amount and add notes
 */
export type AdminRefundAction = {
  refund_id: number
  status: RefundStatus
  final_amount: number
  admin_note?: string
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export type ApiResponse<T> = {
  data: T | null
  error: string | null
  success: boolean
}

export type PaginatedResponse<T> = ApiResponse<T> & {
  page: number
  total_pages: number
  total_count: number
  has_more: boolean
}

export type ProductType = {
  is_new?: boolean
  id: number
  variant_id: number
  name: string
  price: number
  old_price: number
  stock?: number
  size?: string
  image: string
  validation_till: string
  description: string
  sku: string
  package: string
  category: string
  color: string
  color_images?: string[]
  color_image?: string[]
  measurements: string
  thumbnails?: string[]
  product_variant?: any[]
  is_deleted?: boolean
  created_at: string
}

export type QuestionType = {
  id: string;
  product_id: number;
  user_id: string;
  name: string;
  question: string;
  answer: string | null;
  created_at: string;
};
