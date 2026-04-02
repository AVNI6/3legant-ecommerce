# PROPELIUS E-COMMERCE PLATFORM
## Complete Detailed Architecture & Workflow Report
**Date:** March 23, 2026
**Version:** 1.0
**Platform:** Next.js 16.1.6 + Supabase + Stripe

---

## TABLE OF CONTENTS
1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [User Types & Roles](#user-types--roles)
4. [Complete Workflows](#complete-workflows)
5. [Modules & Functionalities](#modules--functionalities)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Authentication & Authorization](#authentication--authorization)
9. [State Management](#state-management)
10. [Enums & Constants](#enums--constants)

---

## EXECUTIVE SUMMARY

**Propelius** is a full-stack e-commerce platform built with modern web technologies. The system supports three distinct user types (Guest, Registered User, Admin) with role-based access control and complex business logic including shopping, checkout, refunds, and administrative management.

### Key Statistics:
- **16 main tables** in PostgreSQL database
- **12+ API endpoints** for core functionality
- **8 Redux slices** for state management
- **5 user account pages** with specialized functionality
- **15+ admin management pages**
- **3-step checkout process** with Stripe payment integration
- **Refund system** with configurable refund window
- **6 review statuses** and Q&A system

---

## SYSTEM ARCHITECTURE

### Technology Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS 4, React Icons |
| **State Management** | Redux Toolkit |
| **Backend/Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth with JWT |
| **Payment Processing** | Stripe Checkout |
| **File Storage** | Supabase Storage (S3-compatible) |
| **Email** | EmailJS REST API |
| **Documents** | @react-pdf/renderer |
| **Content** | MDX (Next MDX Remote) |
| **Forms** | React Hook Form |
| **Carousel** | React Slick |

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Next.js)                   │
│  Pages | Components | Sections | Forms                      │
│  (React Components with TypeScript)                          │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────v────────────────────────────────────────┐
│              STATE MANAGEMENT (Redux Toolkit)               │
│  Auth | Product | Cart | Wishlist | Order | Coupon | Address│
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────v────────────────────────────────────────┐
│           API LAYER (Next.js Route Handlers)                │
│  /api/auth | /api/stripe | /api/admin | /api/orders        │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────v────────────────────────────────────────┐
│    BACKEND SERVICES (Supabase + Third Parties)             │
│  PostgreSQL | Supabase Auth | Stripe API | EmailJS API     │
└─────────────────────────────────────────────────────────────┘
```

---

## USER TYPES & ROLES

### 1. GUEST USER

**Definition:** Non-authenticated user browsing the platform

**Characteristics:**
- No user ID assigned
- Session-based cart stored in localStorage
- Limited access to features
- Can browse products, add to cart, but must login for checkout

**Restrictions:**
- ❌ Cannot place orders
- ❌ Cannot view saved addresses
- ❌ Cannot view wishlist
- ❌ Cannot view account profile
- ❌ Cannot leave reviews (only view)
- ❌ Cannot request refunds

**Allowed Actions:**
- ✅ View product catalog
- ✅ Search products by category/price
- ✅ View product details & reviews
- ✅ Add/remove items to guest cart (localStorage)
- ✅ Update quantity in guest cart
- ✅ View shopping cart
- ✅ Subscribe to newsletter
- ✅ Request password reset
- ✅ View blog posts
- ✅ Submit contact form
- ✅ Ask product questions (as guest)

**Guest Cart Storage:**
```javascript
Key: "guest-cart-items" (localStorage)
Format: CartItem[] = [{
  id: number,
  variant_id: number,
  name: string,
  price: number,
  quantity: number,
  color: string,
  image: string
}]
```

**Guest Shipping Storage:**
```javascript
Key: "selected-shipping-method" (localStorage)
Format: { name: string, cost: number }
```

---

### 2. REGISTERED USER (Customer)

**Definition:** Authenticated user with customer role

**Database Reference:**
- `profiles` table: `role = 'user'`
- `auth.users` table: Supabase authentication record

**User Data Structure:**
```typescript
{
  id: UUID (from auth.users),
  email: string (unique),
  name: string,
  role: 'user',
  avatar_url?: string,
  created_at: timestamp,
  phone?: string,
  is_blocked?: boolean
}
```

**Full Access Actions:**
- ✅ Create account
- ✅ Login/Logout
- ✅ View & edit profile
- ✅ Change password
- ✅ Upload avatar
- ✅ Manage shipping/billing addresses
- ✅ Add/remove items to cart (synced to database)
- ✅ View cart with real-time updates
- ✅ Proceed to checkout (3-step process)
- ✅ Select shipping method
- ✅ Apply coupon codes
- ✅ Complete Stripe payment
- ✅ View order history with pagination
- ✅ Generate invoice PDF for orders
- ✅ Request refunds (within refund window)
- ✅ Track order status
- ✅ Manage wishlist
- ✅ Leave product reviews (1 per product)
- ✅ Ask product questions
- ✅ View refund status
- ✅ Download invoices

**Restrictions:**
- ❌ Cannot access admin panel
- ❌ Cannot modify other users' data
- ❌ Cannot approve/reject refunds
- ❌ Cannot manage products/orders as admin
- ❌ Cannot modify reviews (can only submit once)

**Database Access:**
- Read/Write own profile
- Read/Write own addresses
- Read/Write own cart
- Read/Write own orders
- Read/Write own reviews
- Read/Write own wishlist
- Read public products & reviews
- Write own question responses

---

### 3. ADMIN USER

**Definition:** Authenticated user with admin role for platform management

**Database Reference:**
- `profiles` table: `role = 'admin'`
- Verified via RPC: `is_admin(user_id)` function

**Admin Data Structure:**
```typescript
{
  id: UUID (from auth.users),
  email: string,
  name: string,
  role: 'admin',
  avatar_url?: string,
  created_at: timestamp
}
```

**Admin Access Permissions:**

#### A. Dashboard Management
- ✅ View dashboard with key metrics
  - Total sales (sum of all order totals)
  - Total orders (count of all orders)
  - Total users (count of all customer profiles)
  - Latest orders with recent activity
  - Order status breakdown (pending/processing/confirmed/shipped/delivered/cancelled)

#### B. Product Management (`/pages/admin/products`)
- ✅ View all products in sortable/filterable table
- ✅ Add new product with:
  - Name, description, category
  - Base price & promotional old price
  - Validation date for offer period
  - Base product image
  - Is_new flag
  - Stock quantity
  - Measurements & package info
- ✅ Edit existing products
- ✅ Manage product variants (color, size, price modifiers, images)
- ✅ Update product stock levels
- ✅ Delete products (soft/hard)
- ✅ View product performance (views, rating, review count)
- ✅ Configure color variant images

#### C. Order Management (`/pages/admin/orders`)
- ✅ View all customer orders
- ✅ Filter orders by:
  - Order status (pending/processing/confirmed/shipped/delivered/cancelled)
  - Payment status (pending/success/failed/refund/cancelled)
  - Refund status (null/pending/approved/rejected/processed)
  - Date range
  - Customer name/email
- ✅ Update order status (mark as processing, shipped, delivered)
- ✅ View order items with snapshot history
- ✅ View shipping & billing addresses
- ✅ Add order notes
- ✅ View payment method used
- ✅ Trigger invoice generation
- ✅ View order total including discounts

#### D. Refund Management (`/pages/admin/refunds`)
- ✅ View pending refund requests
- ✅ View refund status (pending/approved/rejected/processed)
- ✅ Approve refund request:
  - Process Stripe refund via payment_intent_id
  - Update order refund_status to 'processed'
  - Record refund amount in order
  - Create payment record with status = 'refund'
  - Send refund confirmation email
- ✅ Reject refund request:
  - Update refund_status to 'rejected'
  - Add admin comments
- ✅ Set/modify refund window (days after purchase)
  - Default: 15 days
  - Stored in `admin_settings` table with key 'refund_window_days'
  - Affects customer refund eligibility
- ✅ View customer refund reasons
- ✅ Track refund history

#### E. Payment Tracking (`/pages/admin/payments`)
- ✅ View all payment records
- ✅ Filter by:
  - Payment status (pending/success/failed/refund/cancelled)
  - Payment method (card, upi)
  - Date range
  - Customer
- ✅ View payment amount & currency
- ✅ See Stripe payment details
- ✅ Track transaction IDs
- ✅ View payment error messages (if failed)

#### F. Review Management (`/pages/admin/reviews`)
- ✅ View all product reviews
- ✅ Review moderation with statuses:
  - pending: Not yet moderated
  - approved: Visible to customers
  - rejected: Hidden from public
  - spam: Marked as spam
- ✅ Approve/reject reviews
- ✅ Filter reviews by:
  - Status (pending/approved/rejected/spam)
  - Product
  - Rating
  - Date
- ✅ View review content & rating
- ✅ Bulk moderate reviews

#### G. User Management (`/pages/admin/users`)
- ✅ View all registered users
- ✅ View user profile data (name, email, created_at)
- ✅ Block/unblock users
- ✅ View user order history
- ✅ View user activity
- ✅ Delete user accounts (with caution)
- ✅ View user payment methods

#### H. Coupon Management (`/pages/admin/coupons`)
- ✅ Create discount coupon codes with:
  - Discount type (fixed or percentage)
  - Discount value
  - Minimum order amount requirement
  - Usage limit (total uses allowed)
  - Expiration date
  - Active/inactive toggle
- ✅ Edit coupon details
- ✅ Deactivate coupons
- ✅ View usage statistics (usage_count vs usage_limit)
- ✅ Delete coupons
- ✅ Track which orders used which coupons

#### I. Shipping Configuration (`/pages/admin/shipping`)
- ✅ Add/edit shipping methods:
  - Shipping method name (e.g., "Standard", "Express", "Overnight")
  - Shipping type (flat_rate, percentage_based, etc.)
  - Shipping cost/price
  - Associated percentage multiplier
- ✅ Set default shipping method
- ✅ Manage shipping costs per order
- ✅ View shipping method usage

#### J. Settings & Configuration (`/pages/admin/settings`)
- ✅ Refund window configuration
- ✅ Store policies settings
- ✅ Payment method settings
- ✅ Shipping settings
- ✅ Email template configuration
- ✅ Tax settings (if applicable)

#### K. File Upload Management (`/pages/admin/upload`)
- ✅ Upload product images to Supabase Storage
- ✅ Upload blog images
- ✅ Upload banner images
- ✅ Manage image gallery
- ✅ Get image URLs for use in product/banner records

#### L. Community Management (`/pages/admin/community`)
- ✅ Manage product questions & answers
- ✅ Answer customer questions
- ✅ Moderate question content
- ✅ Delete inappropriate questions

#### M. CMS Management (`/pages/admin/cms`)
- ✅ Manage banners:
  - Create/edit/delete banners
  - Upload banner images
  - Set banner position
  - Configure banner links & CTAs
  - Enable/disable banners
- ✅ Manage blog posts:
  - Create blog articles (MDX content)
  - Edit existing posts
  - Publish/draft status
  - Set cover images
  - Manage SEO metadata
  - Schedule posts (if implemented)

#### N. Admin Dashboard Statistics
```typescript
Analytics Data Shown:
- Total Revenue (sum of all order.total_price)
- Total Orders (count of all orders)
- Total Customers (count of distinct order.user_id)
- Recent Orders (latest 10 orders with customer name, total, status)
- Order Status Distribution (pie/bar chart):
  - Pending count
  - Processing count
  - Confirmed count
  - Shipped count
  - Delivered count
  - Cancelled count
- Revenue Trend (time-series data)
- Top Products (by sales volume)
- Customer Growth (new customers per period)
```

**Admin Workflow Restrictions:**
- ❌ Cannot place personal orders as customer through checkout
- ❌ Cannot access customer account pages unless in dedicated admin view
- ❌ Cannot manually create/modify other admin accounts (for security)

**Access Control:**
- Middleware checks `/pages/admin/*` routes
- Verifies authentication
- Checks `profiles.role` = 'admin'
- Redirects to login if not authorized
- Redirects to home if not admin

---

## COMPLETE WORKFLOWS

### WORKFLOW 1: GUEST → USER SIGNUP & LOGIN

#### A. Guest Signs Up

**Initiation:** User clicks "Sign Up" link

**Step-by-Step Process:**

1. **Landing on Signup Form** (`/pages/signup`)
   - Form fields: firstName, lastName, email, password, agreeToTerms checkbox
   - Validation rules:
     ```
     - Email: Valid email format
     - Password: Min 6 characters
     - Name: Required, min 2 characters
     - Terms: Must be checked
     ```

2. **Form Submission** → `form/Signup.tsx` → React Hook Form
   ```typescript
   const onSubmit = async (data: SignUpInputs) => {
     // Validate form data
     // Call Supabase auth.signUp()
   }
   ```

3. **Backend Processing** → API Route (handled client-side or via Supabase SDK)
   - Supabase `auth.signUp()` creates user in `auth.users` table
   - Triggers confirmation email (if email verification enabled)

4. **Profile Creation** → `/app/api/auth/signup/route.ts`
   - Receives: `{ userId, name, email }`
   - Creates record in `profiles` table:
     ```sql
     INSERT INTO profiles (id, name, email, role, created_at)
     VALUES (userId, name, email, 'user', NOW())
     ```
   - Error handling: If profile exists (duplicate key), returns success
   - Role automatically set to **'user'**

5. **Redux State Update** (`authSlice`)
   - `setAuth()` action called with user data
   - State updated:
     ```typescript
     {
       user: { id, email, name, role: 'user' },
       session: { access_token, refresh_token, expires_at },
       isAdmin: false,
       loading: false
     }
     ```

6. **JWT Token Storage**
   - Supabase automatically stores JWT in secure httpOnly cookie
   - Access token cached in memory

7. **Redirect & Navigation**
   - User redirected to home page (`/`)
   - Navbar shows logged-in state
   - User can now access account pages

**Side Effects:**
- ✉️ Confirmation email sent (if configured)
- 📦 Cart merged if guest had items (localStorage → Supabase)
- 📍 Profile record created in database

---

#### B. Registered User Login

**Initiation:** User clicks "Sign In" link

**Step-by-Step Process:**

1. **Landing on Login Form** (`/pages/signin`)
   - Form fields: email, password, rememberMe checkbox
   - Validation: Email format, password required

2. **Form Submission** → `form/Signin.tsx`
   ```typescript
   const onSubmit = async (data: SignInInputs) => {
     try {
       const { data: { user, session }, error } =
         await supabase.auth.signInWithPassword({
           email: data.email,
           password: data.password
         })
       // Handle success/error
     }
   }
   ```

3. **Supabase Auth Verification**
   - Supabase checks credentials against `auth.users`
   - If valid: Returns JWT tokens
   - If invalid: Returns error

4. **User Profile Fetch**
   - Redux action queries `profiles` table
   - Gets user name, role, avatar
   ```typescript
   SELECT * FROM profiles WHERE id = userId
   ```

5. **Cart State Management**
   - If guest cart exists (localStorage) + user cart exists:
     - **Merge operation**: Combine items, sum quantities
     - Write merged cart to Supabase `cart_items`
     - Clear localStorage
   - If no Supabase cart exists: Create one

6. **Redux State Update**
   ```typescript
   authSlice.setAuth({
     user: userRecord,
     session: sessionData,
     isAdmin: checkIsAdmin(user.id) // RPC call
   })
   ```

7. **Admin Role Check** (via Redux thunk)
   ```typescript
   const { data: isAdmin } = await supabase.rpc('is_admin', { user_id: userId })
   ```
   - Queries `profiles` table for role
   - Sets `auth.isAdmin` flag

8. **Redirect**
   - User redirected to home page
   - Can access account pages now

**Session Management:**
- JWT expires in 3600 seconds (1 hour)
- Refresh token used for automatic refresh
- "Remember Me" can extend session (if implemented)

---

#### C. Password Reset (Forgot Password)

1. **User clicks "Forgot Password"** → `/pages/forgotpassword`
2. **Enters email address**
3. **Backend sends reset link** via Supabase
   - Link includes reset token
   - Sent to user email
4. **User clicks reset link** → `/pages/resetpassword?token=xxx`
5. **User enters new password**
6. **Backend validates token & updates password**
   - Supabase `auth.updateUser()` with new password
   - Old login credentials invalidated

---

### WORKFLOW 2: PRODUCT BROWSING & FILTERING

#### A. Product Catalog Access

**Route:** `/pages/product`

**Initial Load:**
1. Server component fetches products from Supabase
   ```typescript
   SELECT * FROM products
   WHERE is_active = true
   ORDER BY created_at DESC
   LIMIT 20
   ```
2. Products passed to client component `ProductPageContent.tsx`

**Product Data Structure:**
```typescript
{
  id: 1,
  name: "Premium Sofa",
  description: "High-quality designer sofa",
  price: 999.99,           // Base price (from product_variant)
  old_price: 1299.99,      // Original price for discount
  image: "/public/products/P1.png",
  category: "furniture",
  stock: 50,
  rating: 4.5,
  review_count: 23,
  validation_till: "2026-04-15",  // Offer expiry
  is_new: true,
  variants: [
    {
      id: 1,
      color: "Black",
      size: "Large",
      stock: 20,
      price_modifier: 0,
      color_images: ["color_black_1.png", "color_black_2.png"]
    }
  ]
}
```

#### B. Filtering & Sorting

**Filters Available:**
1. **By Category** (dropdown)
   - Sends query parameter: `?category=furniture`
   - Filters `products.category`

2. **By Price Range** (slider)
   - Min-Max range selector
   - Filters `product_variant.price` BETWEEN min AND max

3. **By Rating** (checkbox)
   - Filters by rating >= selected value
   - Filters `products.rating`

4. **Sorting** (dropdown)
   - Default: Newest first (created_at DESC)
   - Highest Price: price DESC
   - Lowest Price: price ASC
   - Most Rated: rating DESC
   - Other options: Best Selling, Most Viewed

**Filter Implementation:**
```typescript
// ProductPageContent.tsx
filters = {
  category: 'furniture',
  minPrice: 100,
  maxPrice: 1000,
  minRating: 4,
  sortBy: 'newest'
}

// Redux: productSlice.setFilters(filters)
// Selector: selectFilteredProducts(filters)
```

#### C. Product Display

**Grid Layout:**
- Default: 3 columns on desktop
- 2 columns on tablet
- 1 column on mobile
- Cards show: image, name, price, rating, "Add to Cart" button

**Product Card Component:**
```typescript
interface ProductCardProps {
  id: number
  name: string
  price: number
  image: string
  rating: number
  stock: number
}
```

---

### WORKFLOW 3: ADD TO CART (Guest vs Registered User)

#### A. Guest User Add to Cart

**Trigger:** Click "Add to Cart" on product

**Process:**

1. **Get Current Cart Items from localStorage**
   ```javascript
   const items = localStorage.getItem("guest-cart-items")
   const cartItems = items ? JSON.parse(items) : []
   ```

2. **Check if Item Already in Cart**
   ```typescript
   const existing = cartItems.find(i => i.variant_id === newItem.variant_id)
   ```

3. **If Exists:**
   - Increment quantity
   ```typescript
   { ...existing, quantity: existing.quantity + 1 }
   ```

4. **If New:**
   - Add new item with qty = 1
   ```typescript
   {
     id: productId,
     variant_id: variantId,
     name: productName,
     price: effectivePrice,
     color: selectedColor,
     image: productImage,
     quantity: 1
   }
   ```

5. **Save to localStorage**
   ```javascript
   localStorage.setItem("guest-cart-items", JSON.stringify(newCartItems))
   ```

6. **Redux Update** (cartSlice)
   ```typescript
   loadGuestCart() // Reads from localStorage
   state.items = newCartItems
   ```

7. **UI Feedback**
   - Toast notification: "Added to cart!"
   - Cart count badge updated
   - Item appears in cart drawer

---

#### B. Registered User Add to Cart

**Trigger:** Click "Add to Cart" on product

**Process:**

1. **Redux Dispatch** → `addToCart` async thunk
   ```typescript
   dispatch(addToCart({
     userId: user.id,
     item: {
       id: productId,
       variant_id: variantId,
       name: productName,
       price: effectivePrice,
       color: selectedColor,
       image: productImage
     },
     quantity: 1
   }))
   ```

2. **Supabase Cart Fetch**
   - Get user's cart ID (from `cart` table)
   ```typescript
   SELECT id FROM cart WHERE user_id = userId
   ```
   - If no cart exists: Create one
   ```typescript
   INSERT INTO cart (user_id) VALUES (userId)
   ```

3. **Check for Existing Item in Cart**
   ```typescript
   SELECT * FROM cart_items
   WHERE cart_id = cartId AND variant_id = variantId
   ```

4. **If Exists:**
   - Update quantity
   ```sql
   UPDATE cart_items
   SET quantity = quantity + 1
   WHERE cart_id = cartId AND variant_id = variantId
   ```

5. **If New:**
   - Insert new cart item
   ```sql
   INSERT INTO cart_items (cart_id, product_id, variant_id, quantity, color)
   VALUES (cartId, productId, variantId, 1, color)
   ```

6. **Fetch Updated Cart**
   - Call `fetchCart()` thunk to refresh cart state
   ```typescript
   SELECT * FROM cart_items
   INNER JOIN product_variant ON cart_items.variant_id = product_variant.id
   INNER JOIN products ON product_variant.product_id = products.id
   ```

7. **Redux State Update**
   ```typescript
   state.items = [
     {...existingItems},
     {...newItem}
   ]
   state.cartId = cartId
   ```

8. **Effective Price Calculation** (in `cartSlice.fetchCart`)
   ```typescript
   const effectivePrice = getEffectivePrice({
     price: variant.price,
     oldPrice: variant.old_price,
     validationTill: product.validation_till
   })

   // Function checks if offer is still active
   // If yes: use base price
   // If no & old_price exists: use old_price
   // Otherwise: use base price
   ```

9. **UI Update**
   - Cart item count updated
   - Toast: "Added to cart!"
   - Cart drawer shows new item

**Stock Validation:**
- At add time: Checks `product_variant.stock`
- If stock < qty: Shows warning
- Prevents adding beyond available stock

---

### WORKFLOW 4: SHOPPING CART & CHECKOUT (3-STEP PROCESS)

#### A. Step 1: Cart Review

**Route:** `/pages/cart` (activeStep = 1)

**Display:**
- List all cart items with:
  - Product image, name
  - Selected color/size
  - Quantity (with +/- buttons)
  - Unit price & line total
  - Remove button

- Order Summary:
  - Subtotal: sum of (price × quantity)
  - Coupon discount: (if applied)
  - Shipping: (if calculated)
  - Tax: (if applicable)
  - Total: subtotal - discount + shipping + tax

**Actions Available:**

1. **Update Quantity**
   - Click +/- buttons
   - Calls `updateQuantity` or `setQuantity` async thunk
   - For guest: Updates localStorage
   - For registered: Updates Supabase `cart_items`

2. **Remove Item**
   - Click remove button
   - Calls `removeFromCart` async thunk
   - Removes from cart (localStorage or DB)
   - Refreshes cart state

3. **Apply Coupon Code**
   - Input coupon code
   - Validation happens at checkout (not here)
   - Stored in Redux `couponSlice`

4. **Select Shipping Method**
   - Dropdown of shipping methods from `shipping_methods` table
   - Options: Standard, Express, Overnight, etc.
   - Shipping cost updated in real-time
   - Stored in `cartSlice.selectedShipping`
   - Persists in localStorage

5. **Continue to Checkout**
   - Validates cart has items
   - Sets `activeStep = 2`
   - Navigates to address entry

---

#### B. Step 2: Shipping Address

**Route:** `/pages/cart` (activeStep = 2)

**Display:**
- Form fields for shipping address:
  ```
  - First Name, Last Name
  - Phone number
  - Street address
  - City, State/Province
  - Postal/ZIP code
  - Country
  ```

- Option to **use saved address**:
  - Fetches user's saved addresses from `addresses` table
  - Shows radio buttons to select
  - Pre-populates form on selection

- **Billing Address Options:**
  - Checkbox: "Same as shipping address"
  - If unchecked: Shows separate billing form
  - Pre-fills with shipping if checked

**Validation:**
```typescript
- First Name: Required, min 2 chars
- Last Name: Required, min 2 chars
- Phone: Required, valid format
- Street: Required, min 5 chars
- City: Required, min 2 chars
- State: Required
- ZIP: Required, min 3 chars
- Country: Required
```

**Data Storage (Redux):**
```typescript
cartSlice.shippingAddress = {
  firstName: "John",
  lastName: "Doe",
  phone: "+1234567890",
  street: "123 Main St",
  city: "New York",
  state: "NY",
  zip: "10001",
  country: "USA"
}

cartSlice.billingAddress = {...} // If different
```

**Actions:**
1. **Select Saved Address:**
   - Populates form with saved address data

2. **Use New Address:**
   - Enter details into form fields

3. **Save Address for Future:**
   - Checkbox "Save this address for future"
   - On checkout confirmation, saves to DB

4. **Continue to Payment**
   - Validates all fields
   - Sets `activeStep = 3`
   - Navigates to payment confirmation

---

#### C. Step 3: Payment Confirmation

**Route:** `/pages/cart` (activeStep = 3)

**Display:**
- **Cart Summary:**
  - All items with prices
  - Subtotal
  - Discount (if coupon applied)
  - Shipping cost
  - Tax
  - **Grand Total**

- **Address Summary:**
  - Shipping address
  - Billing address

- **Payment Method Selection:**
  - Credit/Debit Card (Stripe)
  - UPI (India only, if enabled in Stripe)

- **Order Disclaimers:**
  - Terms & conditions checkbox
  - Privacy policy link
  - Refund policy link

**Payment Flow:**

1. **User clicks "Place Order"**
   - Validates all data entered
   - User must accept terms

2. **Call Stripe Checkout API** → `/app/api/stripe/checkout/route.ts`

   **Request Payload:**
   ```typescript
   {
     items: [
       { productId, variantId, quantity }
     ],
     cartSnapshot: [
       { id, name, price, quantity, color, image }
     ],
     successUrl: "https://domain/pages/cart?checkout=success&session_id=xxx",
     cancelUrl: "https://domain/pages/cart?checkout=cancel&session_id=xxx",
     paymentMethod: "card" | "upi",
     shippingAmount: 50,
     discountAmount: 20,
     totalAmount: 999.99,
     country: "USA",
     shippingAddress: {...},
     billingAddress: {...},
     couponCode: "SAVE20",
     metadata: { userId, userEmail }
   }
   ```

3. **Backend Processing:**

   **Price Calculation (Server-Side):**
   - Fetches product variant prices from DB (anti-fraud)
   - Calculates base subtotal
   - Validates coupon code:
     ```sql
     SELECT * FROM coupons
     WHERE code = couponCode AND active = true AND expires_at > NOW()
     ```
   - If percentage discount: `appliedDiscount = subtotal * (discount_value / 100)`
   - If fixed discount: `appliedDiscount = discount_value`
   - Validates offer validity (validation_till)
   - Creates Stripe line items with adjusted prices
   - Validates total matches expected amount (prevents client tampering)

   **Coupon Validation Steps:**
   - Code exists and is active
   - Not expired
   - Usage limit not reached
   - Minimum order amount met
   - Applied to line items with reduced unit amounts

   **Stripe Session Creation:**
   ```typescript
   const session = await stripe.checkout.sessions.create({
     mode: "payment",
     payment_method_types: ["card"], // or ["upi"]
     line_items: [
       {
         price_data: {
           currency: "usd",
           product_data: { name: "Premium Sofa" },
           unit_amount: 97999 // $979.99 in cents
         },
         quantity: 1
       }
     ],
     success_url: successUrl,
     cancel_url: cancelUrl,
     metadata: { userId, ... }
   })
   ```

   **Payment Record Created (in `payments` table):**
   ```sql
   INSERT INTO payments (
     payment_id, order_id, transaction_id, method, status,
     user_id, amount, currency, details
   )
   VALUES (
     session.id,
     null, -- Not yet confirmed
     null,
     'card',
     'pending',
     userId,
     999.99,
     'usd',
     {
       items: [...],
       cartSnapshot: [...],
       shippingAddress: {...},
       billingAddress: {...},
       discountAmount: 20,
       couponCode: 'SAVE20'
     }
   )
   ```

4. **Redirect to Stripe Checkout**
   - Frontend receives `sessionId` & `url`
   - Redirects user to Stripe-hosted checkout page
   - User enters card details or UPI ID
   - Stripe processes payment

5. **Payment Success**
   - User redirected to `successUrl`
   - Query params: `?checkout=success&session_id=xxx`

   **Confirmation API Call** (`/app/api/stripe/confirm/route.ts`)
   - Receives `sessionId` from query params
   - Retrieves Stripe session
   - Checks `session.payment_status == "paid"`
   - Gets payment record from DB
   - **Creates Order:**
     ```sql
     INSERT INTO orders (
       user_id, total_price, status, items_snapshot,
       shipping_address, billing_address, payment_method,
       order_date, coupon_code, discount_amount
     )
     VALUES (userId, amount, 'confirmed', cartSnapshot, ...)
     ```
   - **Creates Order Items:**
     ```sql
     INSERT INTO order_items (
       order_id, product_id, variant_id, quantity, price, color
     )
     VALUES (newOrderId, ...) -- For each item
     ```
   - **Updates Stock:**
     ```sql
     UPDATE product_variant
     SET stock = stock - quantity
     WHERE id = variant_id
     ```
   - **Saves Addresses:**
     ```sql
     INSERT INTO addresses (
       user_id, address_type, first_name, last_name, ...
     )
     VALUES (userId, 'shipping', ...)
     ```
   - **Updates Payment Record:**
     ```sql
     UPDATE payments
     SET status = 'success', order_id = newOrderId,
         transaction_id = session.payment_intent
     WHERE payment_id = sessionId
     ```
   - **Clears Cart:**
     ```sql
     DELETE FROM cart_items
     WHERE cart_id IN (SELECT id FROM cart WHERE user_id = userId)
     ```
   - **Triggers Invoice Generation:**
     - Async call to `generateInvoiceForOrderWithRetry()`
     - Generates PDF invoice
     - Uploads to Supabase Storage
     - Returns invoice URL
   - **Updates Order with Invoice:**
     ```sql
     UPDATE orders
     SET invoice_url = 'https://...', invoice_sent_at = NOW()
     WHERE id = orderId
     ```
   - **Sends Confirmation Email:**
     - Via EmailJS
     - Template: Order confirmation with order details
     - Attachment: Invoice PDF link

6. **Failure Handling**
   - If `session.payment_status != "paid"`:
     ```sql
     UPDATE payments
     SET status = 'failed'
     WHERE payment_id = sessionId
     ```
   - User redirected to `cancelUrl`
   - Can retry checkout with same cart

---

### WORKFLOW 5: USER ACCOUNT & PROFILE MANAGEMENT

#### A. User Profile Page (`/pages/account`)

**Layout:**
- Sidebar with navigation options
- Main content area (AccountDetails component)

**User Profile Management:**

1. **View/Edit Profile**
   - Display current: name, email, phone, avatar
   - Editable fields with form validation
   - Save changes (via Supabase update)

2. **Upload Avatar**
   - Avatar.tsx component
   - Upload to Supabase Storage bucket
   - Save URL to `profiles.avatar_url`
   - Display in navbar & profile page

3. **Change Password**
   - Current password verification
   - New password (min 6 chars)
   - Confirm password
   - Calls `supabase.auth.updateUser({ password })`

---

#### B. Address Management (`/pages/account/address`)

**Features:**
- List saved addresses (paginated)
- Each address shows: type (Shipping/Billing), details, buttons
- Add new address button
- Edit/Delete buttons per address

**Database Schema:**
```sql
addresses:
- id (UUID)
- user_id (FK: auth.users)
- address_type ('shipping' | 'billing')
- first_name, last_name
- phone, street, city, state, zip, country
- is_default (boolean)
- address_label ('Home', 'Office', etc.)
- created_at
```

**Operations:**

1. **List Addresses**
   ```sql
   SELECT * FROM addresses
   WHERE user_id = currentUser.id
   ORDER BY is_default DESC, created_at DESC
   LIMIT 10 OFFSET (page-1)*10
   ```

2. **Add Address**
   ```sql
   INSERT INTO addresses (user_id, address_type, ...)
   VALUES (userId, 'shipping', ...)
   ```

3. **Edit Address**
   ```sql
   UPDATE addresses SET ... WHERE id = addressId
   ```

4. **Delete Address**
   ```sql
   DELETE FROM addresses WHERE id = addressId
   ```

5. **Set Default Address**
   ```sql
   UPDATE addresses SET is_default = FALSE WHERE user_id = userId
   UPDATE addresses SET is_default = TRUE WHERE id = addressId
   ```

---

#### C. Order History (`/pages/account/order`)

**Features:**
- List all user's orders (paginated)
- Filter by status
- Sort by date
- Each order shows: Order ID, Date, Total, Status, Action buttons

**Order List Data:**
```sql
SELECT o.*, COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = userId
GROUP BY o.id
ORDER BY o.order_date DESC
LIMIT 10 OFFSET (page-1)*10
```

**Order Statuses Displayed:**
```
PENDING → PROCESSING → CONFIRMED → SHIPPED → DELIVERED
                      ↘ CANCELLED
               ↙ REFUND_PENDING
          ↙ REFUND_APPROVED
     ↙ REFUND_PROCESSED
```

**Actions Per Order:**
1. **View Details**
   - Order ID, date, total
   - Items purchased (with snapshots)
   - Shipping/billing addresses
   - Payment method
   - Current status

2. **Download Invoice**
   - Generates PDF if not cached
   - Downloads invoice document
   - Contains: Order details, items, total, invoice number

3. **Request Refund**
   - Shows refund button (if within refund window)
   - Refund window: 15 days (configurable by admin)
   - Button disabled if outside window
   - Navigates to refund request form

4. **Track Order**
   - Shows current status
   - Timeline of status changes (if tracked)
   - Estimated delivery date

---

#### D. Wishlist (`/pages/account/wishlist`)

**Features:**
- List favorited products
- Each item shows: product image, name, price, actions
- Add to cart button
- Remove from wishlist button

**Database Schema:**
```sql
wishlist:
- id (UUID)
- user_id (FK: auth.users)
- variant_id (FK: product_variant)
- created_at
```

**Operations:**

1. **Add to Wishlist**
   ```sql
   INSERT INTO wishlist (user_id, variant_id)
   VALUES (userId, variantId)
   ```

2. **Remove from Wishlist**
   ```sql
   DELETE FROM wishlist WHERE user_id = userId AND variant_id = variantId
   ```

3. **Get Wishlist Items**
   ```sql
   SELECT p.*, pv.* FROM wishlist w
   JOIN product_variant pv ON w.variant_id = pv.id
   JOIN products p ON pv.product_id = p.id
   WHERE w.user_id = userId
   ORDER BY w.created_at DESC
   ```

4. **Add Wishlist Item to Cart**
   - Triggers `addToCart` action with variant data
   - Item added to cart
   - Can optionally remove from wishlist after

---

### WORKFLOW 6: REFUND REQUEST & PROCESSING

#### A. Customer Requests Refund

**Eligibility Check:**
- Order status must be 'delivered' or 'confirmed'
- Within refund window (default 15 days, configurable)

**Refund Request Form:**
```typescript
{
  order_id: number,
  reason: 'item_damaged' | 'wrong_item' | 'not_as_described' | 'changed_mind' | 'other',
  requested_amount: number,
  notes?: string
}
```

**Process:**

1. **User clicks "Request Refund"** on order
   - Shows refund request modal
   - Displays order details & refund-eligible items

2. **Calculates Refund Eligibility**
   ```typescript
   const orderDate = new Date(order.order_date)
   const daysElapsed = (Date.now() - orderDate.getTime()) / (1000 * 3600 * 24)
   const refundWindowDays = await getRefundWindowDays() // From admin_settings

   if (daysElapsed > refundWindowDays) {
     return "Refund window expired"
   }
   ```

3. **User Fills Form:**
   - Selects refund reason
   - Enters requested amount (can't exceed order total)
   - Optional: Adds notes for admin

4. **Frontend Validation:**
   - Reason selected
   - Amount > 0 and ≤ order total
   - Within refund window

5. **Submit to Backend**
   - Creates refund request (if separate refund_requests table)
   - Updates order: `refund_status = 'pending'`
   - Sends notification to admin

6. **Database Update:**
   ```sql
   UPDATE orders
   SET refund_status = 'pending',
       refund_reason = reason,
       refund_amount = requested_amount
   WHERE id = order_id
   ```

7. **User Notification:**
   - Toast: "Refund request submitted"
   - Email confirmation sent
   - Order shows: "Refund Pending"

---

#### B. Admin Reviews & Approves Refund

**Admin Dashboard Refund Page:**

1. **View Pending Refund Requests**
   ```sql
   SELECT * FROM orders
   WHERE refund_status = 'pending'
   ORDER BY order_date DESC
   ```

2. **Refund Details Shown:**
   - Order ID, customer name, date
   - Order total & refund amount
   - Refund reason stated by customer
   - Add notes field

3. **Admin Actions:**

   **Option A: Approve Refund**

   - Admin enters final refund amount (can modify)
   - Clicks "Approve Refund"
   - Backend call: `POST /api/stripe/refund`

   **Request Payload:**
   ```typescript
   {
     order_id: number,
     amount: number,
     admin_note: string
   }
   ```

   **Backend Processing** (`/app/api/stripe/refund/route.ts`):

   ```typescript
   1. Fetch order details

   2. Fetch payment record from payments table
      - Query: SELECT * FROM payments WHERE order_id = order_id
      - Look for transaction_id (Stripe payment intent ID)
      - Use most recent successful payment

   3. Create Stripe refund
      stripe.refunds.create({
        payment_intent: stripePaymentIntentId,
        amount: Math.round(amount * 100),  // Convert to cents
        reason: 'requested_by_customer'
      })

   4. Update order status
      UPDATE orders SET
        refund_status = 'processed',
        refund_amount = amount,
        admin_note = admin_note,
        status = 'cancelled'
      WHERE id = order_id

   5. Create refund payment record
      INSERT INTO payments (
        payment_id, order_id, transaction_id, method, status, ...
      ) VALUES (
        stripeRefund.id, order_id, stripeRefund.id, 'stripe', 'refund', ...
      )

   6. Send refund confirmation email to customer
      - Via EmailJS
      - Template: Refund approved
      - Amount refunded
      - Timeline for funds to appear
   ```

   **Response:**
   ```typescript
   {
     success: true,
     refund: {
       id: 're_xxx',
       status: 'succeeded' | 'pending',
       amount: 99999,  // cents
     },
     updatedOrder: {
       id: order_id,
       refund_status: 'processed',
       refund_amount: 999.99
     }
   }
   ```

   **Stripe Integration Notes:**
   - Refund goes back to original payment method
   - Takes 3-5 business days typically
   - Stripe updates webhook with refund.created event

   **Option B: Reject Refund**

   - Admin enters rejection reason
   - Clicks "Reject Refund"
   - Backend call: `POST /api/admin/refund/reject`

   ```sql
   UPDATE orders
   SET refund_status = 'rejected',
       admin_note = rejection_reason
   WHERE id = order_id
   ```

   - Email sent to customer with rejection reason

---

#### C. Customer Tracks Refund Status

**Customer sees in Order Details:**
- Refund Status: Pending/Approved/Rejected/Processed
- Refund Amount
- Admin notes (if any)
- Timeline of refund processing

---

### WORKFLOW 7: PRODUCT REVIEW SUBMISSION & MODERATION

#### A. Customer Leaves Review

**Who Can Review:**
- Only verified purchasers (ordered product before)
- One review per product per customer
- Only after order delivered

**Features:**
- Star rating (1-5 stars)
- Written comment (optional)
- Anonymous review option

**Process:**

1. **Customer clicks "Leave Review"** on product detail page

2. **Review Form Appears:**
   ```typescript
   {
     product_id: number,
     rating: 1 | 2 | 3 | 4 | 5,
     comment: string,
     name: string  // Auto-filled from profile
   }
   ```

3. **Form Validation:**
   - Rating selected (1-5)
   - Maximum comment length: 500 chars
   - Name: Min 2 characters

4. **Submit Review**
   - Frontend calls: `POST /api/reviews` (or similar)
   - Creates review record:
     ```sql
     INSERT INTO reviews (
       product_id, user_id, name, rating, comment, created_at
     )
     VALUES (productId, userId, name, rating, comment, NOW())
     ```

5. **Review Status Set:**
   - Initial status: 'pending' (needs moderation)
   - Review not visible to public yet
   - Customer notification: "Review submitted for approval"

6. **Database Record:**
   ```typescript
   {
     id: UUID,
     product_id: number,
     user_id: UUID,
     name: string,
     rating: number (1-5),
     comment: string,
     created_at: timestamp,
     status: 'pending' // Until admin approves
   }
   ```

---

#### B. Admin Moderates Reviews

**Admin Dashboard Review Moderation:**

**View Pending Reviews:**
```sql
SELECT * FROM reviews
WHERE status = 'pending'
ORDER BY created_at DESC
```

**Review Display:**
- Product name/image
- Reviewer name, rating
- Review text/comment
- Submitted date

**Admin Actions:**

1. **Approve Review**
   - Sets status → 'approved'
   - Becomes visible on product page
   ```sql
   UPDATE reviews SET status = 'approved' WHERE id = review_id
   ```

2. **Reject Review**
   - Sets status → 'rejected'
   - Not visible; can give reason
   ```sql
   UPDATE reviews SET status = 'rejected' WHERE id = review_id
   ```

3. **Mark as Spam**
   - Sets status → 'spam'
   - Hidden from public
   ```sql
   UPDATE reviews SET status = 'spam' WHERE id = review_id
   ```

**Review Visibility Logic:**
- Public displays: Only status = 'approved'
- Admin sees: All statuses in moderation queue

**Product Rating Calculation:**
```typescript
const approvedReviews = reviews.filter(r => r.status === 'approved')
const averageRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
const reviewCount = approvedReviews.length

// Update product:
UPDATE products SET rating = averageRating, review_count = reviewCount
```

---

### WORKFLOW 8: PRODUCT Q&A SYSTEM

#### A. Customer Asks Question

**Features:**
- Ask product question without purchasing
- Admin can answer for all to see
- Questions & answers public
- Help other customers make decisions

**Process:**

1. **Customer clicks "Ask a Question"** on product page

2. **Question Form:**
   ```typescript
   {
     product_id: number,
     user_id?: UUID,  // Optional for guests
     name: string,
     question: string
   }
   ```

3. **Submit Question:**
   ```sql
   INSERT INTO questions (
     product_id, user_id, name, question, created_at
   )
   VALUES (productId, userId, name, question, NOW())
   ```

4. **Question Status:**
   - Status: 'unanswered' (waiting for admin response)
   - User notification: "Question submitted"
   - Displayed on product page with "Unanswered" badge

---

#### B. Admin Answers Question

**Admin Dashboard:**

1. **View Unanswered Questions:**
   ```sql
   SELECT * FROM questions
   WHERE answer IS NULL
   ORDER BY created_at DESC
   ```

2. **Answer Question:**
   - Admin types answer
   - Clicks "Post Answer"
   - Updates question record:
   ```sql
   UPDATE questions
   SET answer = admin_answer, updated_at = NOW()
   WHERE id = question_id
   ```

3. **Answer Becomes Public:**
   - Both question & answer shown on product page
   - Status changes to 'answered'
   - Customer notified by email

---

## MODULES & FUNCTIONALITIES

### MODULE 1: AUTHENTICATION & USER MANAGEMENT

**Features:**
1. User registration (signup)
2. User login/logout
3. Password reset via email
4. Admin role detection
5. Session management
6. JWT token handling

**Files:**
- `/form/Signin.tsx` - Login form
- `/form/Signup.tsx` - Registration form
- `/form/ForgotPassword.tsx` - Password recovery
- `/app/pages/signin/page.tsx` - Signin page
- `/app/pages/signup/page.tsx` - Signup page
- `/app/pages/forgotpassword/page.tsx` - Password reset request
- `/app/pages/resetpassword/page.tsx` - Password reset form
- `/app/api/auth/signup/route.ts` - Profile creation API
- `store/slices/authSlice.ts` - Auth state management
- `middleware.ts` - Admin route protection

**Key Logic:**
- JWT token storage in cookies
- Session expiry: 3600 seconds (1 hour)
- Profile creation in Supabase on signup
- Admin role check via RPC
- Automatic cart merging on login

---

### MODULE 2: PRODUCT CATALOG & BROWSING

**Features:**
1. Product listing with pagination
2. Full-text search
3. Category filtering
4. Price range filtering
5. Star rating filtering
6. Sorting (newest, price low-to-high, etc.)
7. Product detail view
8. Product variants (color, size)
9. Effective price calculation with offers

**Files:**
- `/app/pages/product/page.tsx` - Product catalog
- `/app/pages/product/[id]/page.tsx` - Product detail
- `/components/FilterSidebar.tsx` - Filter controls
- `/sections/product/ProductPageContent.tsx` - Product grid
- `/sections/product/ProductDetailContent.tsx` - Product detail client
- `/components/ProductGallery.tsx` - Image gallery
- `/sections/ColorSelector.tsx` - Color variant selector
- `store/slices/productSlice.ts` - Product state
- `lib/utils/productUtils.ts` - Product utilities

**Database Queries:**
```sql
-- Get all products paginated
SELECT * FROM products
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;

-- Get product with variants
SELECT p.*, pv.* FROM products p
LEFT JOIN product_variant pv ON p.id = pv.product_id
WHERE p.id = productId;

-- Filter by category & price
SELECT * FROM products p
JOIN product_variant pv ON p.id = pv.product_id
WHERE p.category = 'furniture' AND pv.price BETWEEN 100 AND 500;
```

---

### MODULE 3: SHOPPING CART

**Features:**
1. Add to cart (guest & user)
2. Remove from cart
3. Update quantity
4. Cart persistence (localStorage for guest, DB for user)
5. Cart merging on login
6. Shipping method selection
7. Real-time cart total calculation
8. Guest checkout support

**Cart Data Structure:**
```typescript
CartItem = {
  id: number,            // Product ID
  variant_id: number,    // Product variant ID
  name: string,
  price: number,         // Effective price after offers
  quantity: number,
  color: string,
  image: string
}
```

**Files:**
- `/sections/cart/ShoppingCart.tsx` - Cart display
- `/sections/cart/CartDrawer.tsx` - Cart sidebar
- `/sections/cart/CheckoutDetail.tsx` - Shipping form
- `/sections/cart/CompleteOrder.tsx` - Payment confirmation
- `/sections/cart/StepIndicator.tsx` - Step progress
- `store/slices/cartSlice.ts` - Cart state
- `components/QuantityInput.tsx` - Quantity selector
- `components/AddToCartButton.tsx` - Add to cart button

**Redux Thunks:**
- `fetchCart` - Load user's cart from DB
- `addToCart` - Add item to cart
- `updateQuantity` - Update item quantity
- `setQuantity` - Set exact quantity
- `removeFromCart` - Remove item from cart
- `clearCartItems` - Empty entire cart

---

### MODULE 4: CHECKOUT & PAYMENT

**Features:**
1. 3-step checkout process
2. Address form validation
3. Stripe payment integration
4. Coupon code validation
5. Shipping method selection
6. Effective price calculation
7. Order creation after payment
8. Invoice generation
9. Order confirmation email
10. Cart clearing after purchase
11. Address auto-saving
12. Stock update on purchase

**Files:**
- `/sections/cart/ShoppingCart.tsx` - Step 1: Cart review
- `/sections/cart/CheckoutDetail.tsx` - Step 2: Address entry
- `/sections/cart/CompleteOrder.tsx` - Step 3: Payment confirmation
- `/app/api/stripe/checkout/route.ts` - Create Stripe session
- `/app/api/stripe/confirm/route.ts` - Confirm payment & create order
- `/app/api/stripe/cancel/route.ts` - Handle payment cancel
- `/lib/server/invoice-service.ts` - PDF invoice generation
- `/lib/server/invoice-email.ts` - Invoice email template
- `store/slices/couponSlice.ts` - Coupon state

**Checkout Flow:**
1. User reviews cart items
2. Enters shipping address
3. Reviews order summary
4. Selects payment method
5. Redirected to Stripe checkout
6. Enters card/UPI details
7. Stripe processes payment
8. Redirect to success/cancel URLs
9. Confirm endpoint creates order
10. Invoice generated
11. Email confirmation sent

---

### MODULE 5: USER ACCOUNT & PROFILE

**Features:**
1. View/edit profile
2. Avatar upload
3. Password change
4. Manage addresses
5. View order history
6. Download invoices
7. Request refunds
8. Manage wishlist

**Files:**
- `/app/pages/account/page.tsx` - Account overview
- `/app/pages/account/AccountDetails.tsx` - Profile editor
- `/app/pages/account/Avatar.tsx` - Avatar uploader
- `/app/pages/account/address/page.tsx` - Address list (Server)
- `/sections/account/AddressClient.tsx` - Address CRUD
- `/app/pages/account/order/page.tsx` - Order list (Server)
- `/sections/account/OrdersContent.tsx` - Order display
- `/app/pages/account/wishlist/page.tsx` - Wishlist
- `store/slices/addressSlice.ts` - Address state

**Database Operations:**
- Profile updates
- Address CRUD operations
- Order history queries
- Wishlist management

---

### MODULE 6: REFUND SYSTEM

**Features:**
1. Refund request submission
2. Refund window validation
3. Admin approval/rejection
4. Stripe refund processing
5. Refund status tracking
6. Email notifications
7. Configurable refund window

**Files:**
- `/app/pages/account/order/page.tsx` - Refund request button
- `/app/api/stripe/refund/route.ts` - Process refund
- `/app/api/admin/refund/reject/route.ts` - Reject refund
- `/app/api/admin/settings/refund-window/route.ts` - Configure
- `/constants/RefundConfig.ts` - Refund constants
- `/lib/server/refund-email.ts` - Refund email template

**Refund Window Logic:**
```typescript
// Get refund window from settings
const refundWindowDays =
  await getRefundWindowDays() // Default: 15

// Check eligibility
const orderDate = new Date(order.order_date)
const daysElapsed = (Date.now() - orderDate) / (1000 * 86400)
const isEligible = daysElapsed <= refundWindowDays

// Calculate remaining days
const daysRemaining = refundWindowDays - daysElapsed
```

**Refund Statuses:**
- `pending` - Customer requested
- `approved` - Admin approved, processing
- `rejected` - Admin rejected
- `processed` - Stripe refund completed

---

### MODULE 7: ADMIN DASHBOARD

**Features:**
1. Dashboard with key metrics
2. Charting/analytics
3. Recent activities
4. Quick actions

**Files:**
- `/app/pages/admin/dashboard/page.tsx` - Main dashboard
- `/app/pages/admin/layout.tsx` - Admin layout
- `/app/api/admin/stats/route.ts` - Dashboard statistics API

**Dashboard Data:**
```typescript
{
  totalRevenue: sum of all order.total_price,
  totalOrders: count of orders,
  totalCustomers: count of distinct users,
  latestOrders: [order...],  // Last 10
  ordersByStatus: {
    pending: count,
    processing: count,
    confirmed: count,
    shipped: count,
    delivered: count,
    cancelled: count
  },
  revenueByDate: [...],  // Time series
  topProducts: [...]        // By sales
}
```

---

### MODULE 8: ADMIN PRODUCT MANAGEMENT

**Features:**
1. Product list with table
2. Add new product
3. Edit product details
4. Manage product variants
5. Upload product images
6. Delete products
7. Search & filter products
8. Bulk operations (if implemented)

**Files:**
- `/app/pages/admin/products/page.tsx` - Product management
- `/app/pages/admin/products/ProductTable.tsx` - Product table
- `/app/pages/admin/products/ProductForm.tsx` - Product form
- `/app/pages/admin/products/add/page.tsx` - Add product
- `/app/api/admin/upload/route.ts` - File upload API

**Product Form Fields:**
```typescript
{
  name: string,
  description: string,
  price: number,
  old_price?: number,
  category: string,
  stock: number,
  image: File | string,
  validation_till?: date,  // Offer expiry
  is_new: boolean,
  measurements?: string,
  package?: string
}
```

---

### MODULE 9: ADMIN ORDER MANAGEMENT

**Features:**
1. View all orders
2. Filter by status
3. View order details
4. Update order status
5. View items & addresses
6. Add order notes
7. Generate invoices
8. Refund management

**Files:**
- `/app/pages/admin/orders/page.tsx` - Order management
- `/app/api/orders/[id]/generate-invoice/route.ts` - Invoice API

**Order Statuses Admin Can Set:**
- pending → processing
- processing → confirmed
- confirmed → shipped
- shipped → delivered
- Any status → cancelled (with reversal of stock/refund?)

---

### MODULE 10: ADMIN REVIEW MODERATION

**Features:**
1. View all reviews
2. Filter by status
3. Approve reviews
4. Reject reviews
5. Mark as spam
6. Bulk moderation

**Files:**
- `/app/pages/admin/reviews/page.tsx` - Review moderation

**Review Moderation Statuses:**
- `pending` - Needs review
- `approved` - Published
- `rejected` - Hidden
- `spam` - Flagged

**Impact on Product:**
- Approved reviews count toward product rating
- Rating: average of all approved reviews
- Review count: number of approved reviews

---

### MODULE 11: COUPON MANAGEMENT

**Features:**
1. Create coupons
2. Set discount (fixed or percentage)
3. Set minimum order
4. Set usage limit
5. Set expiration
6. View usage statistics
7. Deactivate coupons

**Files:**
- `/app/pages/admin/coupons/page.tsx` - Coupon management
- `store/slices/couponSlice.ts` - Coupon state

**Coupon Creation:**
```typescript
{
  code: 'SAVE20',           // Unique
  discount_type: 'percentage' | 'fixed',
  discount_value: 20 or 10,
  min_order: 50,            // Minimum order amount
  usage_limit: 100,         // Max uses
  expires_at: date,
  active: true
}
```

**Validation at Checkout:**
- Code must exist
- Must be active
- Must not be expired
- Usage count < usage_limit
- Order total > min_order

---

### MODULE 12: SHIPPING METHODS

**Features:**
1. Manage shipping methods
2. Set shipping costs
3. Select at checkout
4. View usage

**Files:**
- `/app/pages/admin/shipping/page.tsx` - Shipping management

**Shipping Methods:**
```typescript
{
  id: bigint,
  name: string,              // 'Standard', 'Express', etc.
  type: string,              // 'flat_rate', 'percentage'
  price: numeric,            // Base cost
  percentage?: numeric,      // If percentage-based
}
```

**Checkout Integration:**
- User selects shipping method
- Cost added to order total
- Included in Stripe line items
- Passed to payment processing

---

### MODULE 13: BLOG & CONTENT MANAGEMENT

**Features:**
1. View blog posts
2. Search/filter by category
3. View blog detail with MDX
4. Admin: Create blog posts
5. Admin: Edit/delete posts
6. Admin: Set draft/published

**Files:**
- `/app/pages/blog/page.tsx` - Blog list
- `/app/pages/blog/[slug]/page.tsx` - Blog detail (MDX)
- `/sections/blog/BlogCards.tsx` - Blog card component
- `/sections/blog/BlogArticle.tsx` - Article renderer
- `/app/pages/admin/cms/page.tsx` - CMS management

**Blog Table Schema:**
```sql
blogs:
- id (bigint)
- title (text)
- slug (text)  -- URL-friendly identifier
- content (text)  -- MDX content
- excerpt (text)
- cover_image (text)  -- URL
- author_id (uuid)
- status ('draft' | 'published')
- created_at, updated_at (timestamps)
```

---

### MODULE 14: NEWSLETTER & CONTACT

**Features:**
1. Subscribe to newsletter
2. Contact form submission
3. Email notifications

**Files:**
- `/sections/home/newsletter.tsx` - Newsletter signup
- `/app/pages/contact/page.tsx` - Contact page
- `/form/ContactForm.tsx` - Contact form

**Database Tables:**
```sql
newsletter_subscribers:
- id, email (unique), created_at

contact_messages:
- id, full_name, email, message, created_at
```

---

### MODULE 15: BANNER & PROMO MANAGEMENT

**Features:**
1. Create promotional banners
2. Upload banner images
3. Set banner position/order
4. Link to products/pages
5. Enable/disable banners
6. Admin management

**Files:**
- `/app/pages/admin/cms/page.tsx` - Banner management

**Banner Table Schema:**
```sql
banners:
- id (bigint)
- name, key (unique)
- category (text)
- title, subtitle (text)
- image_url (text)
- link_url (text)  -- Click target
- position (integer)  -- Display order
- is_active (boolean)
- updated_at (timestamp)
```

**Homepage Display:**
- Fetches active banners ordered by position
- Displays in carousel/carousel component
- Links navigate on click

---

## DATABASE SCHEMA

### Core Tables

#### 1. auth.users (Supabase Auth)
```sql
-- Managed by Supabase, not directly queryable via normal queries
id (UUID) PRIMARY KEY
email (text, unique)
encrypted_password (text)
email_confirmed_at (timestamp)
last_sign_in_at (timestamp)
created_at (timestamp)
```

---

#### 2. profiles
```sql
id (UUID) PRIMARY KEY -> FOREIGN KEY auth.users(id)
role (text) DEFAULT 'user' -- 'user' or 'admin'
created_at (timestamp)
name (text)
email (text, unique)
avatar_url (text)
phone (text)
is_blocked (boolean) DEFAULT false
last_activity (timestamp)

RLS Policy: Readable by (anon, authenticated)
```

---

#### 3. products
```sql
id (BIGINT) GENERATED ALWAYS AS IDENTITY PRIMARY KEY
name (text) NOT NULL
description (text)
measurements (text)
package (text)
category (text)
is_new (boolean) DEFAULT true
image (text)
validation_till (date)  -- Offer end date
rating (numeric) DEFAULT 0
review_count (integer) DEFAULT 0
created_at (timestamp) DEFAULT now()
views (integer) DEFAULT 0

Indexes:
- idx_products_category (category)
- idx_products_created_at (created_at DESC)

RLS: Disabled (public read)
```

---

#### 4. product_variant
```sql
id (BIGINT) GENERATED ALWAYS AS IDENTITY PRIMARY KEY
product_id (BIGINT) NOT NULL -> FOREIGN KEY products(id)
sku (text, unique)
color (text[])  -- Array of color options
size (text)
price (double precision) DEFAULT 0  -- Current price
old_price (double precision)  -- For discount calculation
stock (integer) DEFAULT 0
thumbnails (text[])  -- Array of thumbnail URLs
color_images (text[])  -- Array of color variant images
created_at (timestamp)
updated_at (timestamp)

RLS: Disabled (public read)
```

---

#### 5. addresses
```sql
id (UUID) DEFAULT gen_random_uuid() PRIMARY KEY
user_id (UUID) NOT NULL -> FOREIGN KEY auth.users(id)
address_type (text) NOT NULL  -- 'shipping' or 'billing'
first_name (text)
last_name (text)
phone (text)
street (text)
city (text)
state (text)
zip (text)
country (text)
is_default (boolean) DEFAULT false
address_label (text) DEFAULT 'Home'  -- Label for user
created_at (timestamp) DEFAULT now()

Unique Index: (user_id, street, city, state, zip, country)
RLS: Enabled (user reads own only)
```

---

#### 6. cart
```sql
id (UUID) DEFAULT gen_random_uuid() PRIMARY KEY
user_id (UUID) NOT NULL -> FOREIGN KEY auth.users(id)
quantity (integer) DEFAULT 1
created_at (timestamp)
updated_at (timestamp)

RLS: Enabled (user accesses own)
```

---

#### 7. cart_items
```sql
id (UUID) DEFAULT gen_random_uuid() PRIMARY KEY
cart_id (UUID) NOT NULL -> FOREIGN KEY cart(id)
product_id (BIGINT) NOT NULL -> FOREIGN KEY products(id)
quantity (integer) DEFAULT 1
variant_id (BIGINT) -> FOREIGN KEY product_variant(id)
color (text)
created_at (timestamp)

RLS: Enabled (via cart access)
```

---

#### 8. orders
```sql
id (INTEGER) GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY
user_id (UUID) -> FOREIGN KEY auth.users(id)
total_price (numeric) NOT NULL
status (text) DEFAULT 'pending'  -- pending|processing|confirmed|shipped|delivered|cancelled
order_date (timestamp) DEFAULT now()
shipping_address (json) NOT NULL
payment_method (text) NOT NULL  -- 'card', 'upi', etc.
billing_address (json)
items_snapshot (jsonb)  -- Snapshot of items at purchase time
coupon_code (text)
discount_amount (numeric) DEFAULT 0
invoice_url (text)  -- PDF invoice URL
invoice_sent_at (timestamp)
refund_status (text)  -- NULL|pending|approved|rejected|processed
refund_amount (numeric(12,2)) DEFAULT 0
refund_reason (text)
payment_intent_id (text)  -- Stripe payment intent ID
admin_note (text)

Indexes:
- idx_orders_user_id (user_id)
- idx_orders_order_date (order_date DESC)
- idx_orders_refund_status (refund_status) WHERE refund_status IS NOT NULL

RLS: Disabled (admin needs full access)
```

---

#### 9. order_items
```sql
id (INTEGER) GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY
order_id (INTEGER) NOT NULL -> FOREIGN KEY orders(id)
product_id (BIGINT) NOT NULL -> FOREIGN KEY products(id)
price (numeric) NOT NULL  -- Price at time of purchase
quantity (integer) DEFAULT 1
variant_id (BIGINT) -> FOREIGN KEY product_variant(id)
color (text)

RLS: Disabled
```

---

#### 10. payments
```sql
payment_id (text) PRIMARY KEY  -- Stripe session ID
order_id (integer) -> FOREIGN KEY orders(id)
transaction_id (text)  -- Stripe payment intent ID (KEY for refunds!)
method (text) NOT NULL  -- 'card', 'upi', 'stripe'
status (text) NOT NULL DEFAULT 'pending'
  -- CHECK (status IN ('pending', 'success', 'failed', 'cancel', 'refund'))
user_id (uuid) -> FOREIGN KEY auth.users(id)
amount (numeric) DEFAULT 0
currency (text) DEFAULT 'usd'  -- 'usd', 'inr'
details (jsonb)  -- Payment details, cart snapshot, addresses
error_message (text)
created_at (timestamp) DEFAULT now()
updated_at (timestamp) DEFAULT now()

RLS: Disabled (admin tracking)
```

---

#### 11. reviews
```sql
id (UUID) DEFAULT gen_random_uuid() PRIMARY KEY
product_id (BIGINT) NOT NULL -> FOREIGN KEY products(id)
user_id (UUID) -> FOREIGN KEY auth.users(id)
name (text) NOT NULL  -- Reviewer name
rating (integer) NOT NULL CHECK (rating >= 1 AND rating <= 5)
comment (text)
created_at (timestamp) DEFAULT now()
-- No explicit status column; moderation handled separately or in app logic

Unique Index: (product_id, user_id) WHERE user_id IS NOT NULL
RLS: Enabled
```

---

#### 12. wishlist
```sql
id (UUID) DEFAULT gen_random_uuid() PRIMARY KEY
user_id (UUID) -> FOREIGN KEY auth.users(id)
variant_id (BIGINT) -> FOREIGN KEY product_variant(id)
created_at (timestamp)

Unique Index: (user_id, variant_id)
RLS: Enabled (user accesses own)
```

---

#### 13. questions
```sql
id (UUID) DEFAULT gen_random_uuid() PRIMARY KEY
product_id (BIGINT) NOT NULL -> FOREIGN KEY products(id)
user_id (UUID) -> FOREIGN KEY auth.users(id)
name (text)  -- Questioner name (guest or user)
question (text) NOT NULL
answer (text)  -- Admin answer
created_at (timestamp)
updated_at (timestamp)

RLS: Enabled
```

---

#### 14. coupons
```sql
id (BIGINT) GENERATED ALWAYS AS IDENTITY PRIMARY KEY
code (text) UNIQUE NOT NULL
discount_type (text) CHECK (discount_type IN ('fixed', 'percentage'))
discount_value (numeric) NOT NULL
min_order (numeric) DEFAULT 0  -- Minimum order amount
active (boolean) DEFAULT true
created_at (timestamp)
usage_limit (integer)  -- NULL = unlimited
usage_count (integer) DEFAULT 0
expires_at (timestamp)

Unique Index: code
RLS: Disabled
```

---

#### 15. shipping_methods
```sql
id (BIGINT) GENERATED ALWAYS AS IDENTITY PRIMARY KEY
name (text)  -- 'Standard', 'Express'
type (text)  -- 'flat_rate', 'percentage'
price (numeric)
percentage (numeric)  -- If percentage-based

RLS: Disabled
```

---

#### 16. admin_settings
```sql
id (BIGSERIAL) PRIMARY KEY
setting_key (VARCHAR(255)) UNIQUE NOT NULL  -- 'refund_window_days'
setting_value (TEXT) NOT NULL
description (TEXT)
created_at (timestamp) DEFAULT now()
updated_at (timestamp) DEFAULT now()

Unique Index: setting_key
RLS: Disabled
```

---

#### 17. banners
```sql
id (BIGINT) GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY
name (text, unique)
key (text, unique)
category (text)
title (text)
subtitle (text)
image_url (text) NOT NULL
link_url (text)  -- Navigation link
position (integer) DEFAULT 0  -- Display order
is_active (boolean) DEFAULT true
updated_at (timestamp) DEFAULT now()

RLS: Disabled
```

---

#### 18. blogs
```sql
id (BIGINT) GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY
title (text)
slug (text)  -- URL-friendly
content (text)  -- MDX content
excerpt (text)
cover_image (text)  -- URL
author_id (uuid) -> FOREIGN KEY auth.users(id)
status (text)  -- 'draft' or 'published'
created_at (timestamp)
updated_at (timestamp)

RLS: Disabled
```

---

#### 19. newsletter_subscribers
```sql
id (BIGINT) GENERATED ALWAYS AS IDENTITY PRIMARY KEY
email (text, unique) NOT NULL
created_at (timestamp)

RLS: Disabled
```

---

#### 20. contact_messages
```sql
id (BIGINT) GENERATED ALWAYS AS IDENTITY PRIMARY KEY
full_name (text)
email (text)
message (text)
created_at (timestamp)

RLS: Disabled
```

---

## API ENDPOINTS

### Authentication Routes

#### POST `/api/auth/signup`
**Purpose:** Create user profile after signup
**Access:** Supabase auth event (server-side)
**Request:**
```json
{
  "userId": "uuid",
  "name": "John Doe",
  "email": "john@example.com"
}
```
**Response:**
```json
{
  "ok": true,
  "data": { ... }
}
```

---

### Stripe Payment Routes

#### POST `/api/stripe/checkout`
**Purpose:** Create Stripe checkout session
**Access:** Authenticated + Guest
**Request:**
```json
{
  "items": [
    {
      "productId": 1,
      "variantId": 5,
      "quantity": 2
    }
  ],
  "cartSnapshot": [...],
  "successUrl": "...",
  "cancelUrl": "...",
  "paymentMethod": "card" | "upi",
  "shippingAmount": 50,
  "discountAmount": 20,
  "totalAmount": 999.99,
  "country": "USA",
  "shippingAddress": {...},
  "billingAddress": {...},
  "couponCode": "SAVE20",
  "metadata": { "userId": "..." }
}
```
**Response:**
```json
{
  "sessionId": "cs_...",
  "url": "https://checkout.stripe.com/..."
}
```

---

#### POST `/api/stripe/confirm`
**Purpose:** Confirm payment & create order
**Access:** Authenticated + Guest
**Request:**
```json
{
  "sessionId": "cs_..."
}
```
**Response:**
```json
{
  "ok": true,
  "status": "success",
  "orderId": 123
}
```

---

#### POST `/api/stripe/cancel`
**Purpose:** Handle payment cancellation
**Access:** Authenticated + Guest
**Request:**
```json
{
  "sessionId": "cs_..."
}
```
**Response:**
```json
{
  "ok": true,
  "message": "Payment cancelled"
}
```

---

#### POST `/api/stripe/refund`
**Purpose:** Process refund (Admin)
**Access:** Admin only
**Request:**
```json
{
  "order_id": 123,
  "amount": 999.99,
  "admin_note": "Customer requested due to damage"
}
```
**Response:**
```json
{
  "success": true,
  "refund": {...},
  "updatedOrder": {...}
}
```

---

### Admin Routes

#### POST `/api/admin/upload`
**Purpose:** Upload file to Supabase Storage
**Access:** Admin only
**Request:** FormData with file
**Response:**
```json
{
  "url": "https://storage.supabase.co/..."
}
```

---

#### GET `/api/admin/stats`
**Purpose:** Get dashboard statistics
**Access:** Admin only
**Response:**
```json
{
  "totalRevenue": 50000,
  "totalOrders": 250,
  "totalCustomers": 150,
  "latestOrders": [...],
  "ordersByStatus": {...}
}
```

---

#### GET `/api/admin/refund-settings`
**Purpose:** Get current refund window setting
**Access:** Admin only
**Response:**
```json
{
  "refundWindowDays": 15
}
```

---

#### POST `/api/admin/settings/refund-window`
**Purpose:** Update refund window
**Access:** Admin only
**Request:**
```json
{
  "days": 30
}
```
**Response:**
```json
{
  "ok": true,
  "refundWindowDays": 30
}
```

---

#### POST `/api/admin/refund/reject`
**Purpose:** Reject refund request
**Access:** Admin only
**Request:**
```json
{
  "order_id": 123,
  "reason": "Outside refund window"
}
```
**Response:**
```json
{
  "ok": true,
  "refund_status": "rejected"
}
```

---

### Orders Routes

#### POST `/api/orders/[id]/generate-invoice`
**Purpose:** Generate PDF invoice for order
**Access:** Authenticated (own order) + Admin
**Request:**
```
GET /api/orders/123/generate-invoice
```
**Response:**
```json
{
  "invoiceUrl": "https://storage.supabase.co/..."
}
```

---

### Debug Routes

#### GET `/api/debug/check-orders`
**Purpose:** Debug endpoint to check orders (development)
**Access:** Admin or development environment
**Response:**
```json
{
  "total_orders": 10,
  "orders_with_payments": 9,
  "orders_without_payments": 1,
  "details": [...]
}
```

---

## AUTHENTICATION & AUTHORIZATION

### JWT Token Flow

1. **User Signup/Login**
   - Supabase creates JWT token
   - Token includes: user ID, email, role info
   - Stored in secure httpOnly cookie
   - Valid for 3600 seconds (1 hour)

2. **Token Validation**
   - Middleware checks JWT
   - Verifies signature
   - Checks expiry
   - Refreshes if expired

3. **Admin Authentication**
   - On login, user profile checked
   - `authSlice.checkIsAdmin()` RPC called
   - Checks if `profiles.role = 'admin'`
   - Sets `auth.isAdmin` flag

4. **Middleware Protection** (`middleware.ts`)
   - Pattern: `/pages/admin/*`
   - Checks user authentication
   - Verifies admin role
   - Redirects if unauthorized

### RLS (Row Level Security)

**Public Tables (RLS Disabled):**
- products, product_variant
- payments, orders,order_items
- coupons, shipping_methods
- banners, blogs, admin_settings

**User-Private Tables (RLS Enabled):**
- profiles: Readable by all (anon reads own, authenticated reads own)
- addresses: Users only see own
- cart, cart_items: Users only see own
- wishlist: Users only see own
- reviews, questions: Created by user, viewed by all

**RLS Example:**
```sql
CREATE POLICY addresses_user_only ON addresses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY addresses_insert ON addresses
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

---

## STATE MANAGEMENT

### Redux Store Structure

```typescript
store = {
  auth: {
    user: { id, email, name, role },
    session: { access_token, refresh_token },
    isAdmin: boolean,
    loading: boolean
  },

  product: {
    products: Product[],
    filters: {
      category?: string,
      minPrice?: number,
      maxPrice?: number,
      minRating?: number,
      sortBy?: string
    },
    currentPage: number,
    totalPages: number,
    loading: boolean
  },

  cart: {
    items: CartItem[],
    cartId: string | null,
    shippingCost: number,
    selectedShipping: { name, cost } | null,
    activeStep: 1 | 2 | 3,
    loading: boolean,
    error: string | null
  },

  wishlist: {
    items: WishlistItem[],
    loading: boolean
  },

  order: {
    orders: Order[],
    currentPage: number,
    totalPages: number,
    loading: boolean
  },

  coupon: {
    coupons: Coupon[],
    appliedCoupon?: Coupon,
    discountAmount: number
  },

  address: {
    addresses: Address[],
    loading: boolean
  }
}
```

### Redux Slices

1. **authSlice**
   - Actions: `setAuth`, `setLoading`
   - Thunks: `checkIsAdmin`
   - State: user, session, isAdmin, loading

2. **productSlice**
   - Actions: `setFilters`, `setSortBy`, `setCurrentPage`
   - Selectors: `selectFilteredProducts`
   - State: products, filters, pagination

3. **cartSlice**
   - Actions: `setShipping`, `setActiveStep`, `clearCartState`, `loadGuestCart`
   - Thunks: `fetchCart`, `addToCart`, `updateQuantity`, `removeFromCart`
   - Guest cart: localStorage persistence
   - User cart: Supabase DB sync

4. **wishlistSlice**
   - Real-time subscription to changes
   - Add/remove items

5. **orderSlice**
   - Thunks: `fetchOrders`
   - Pagination support

6. **couponSlice**
   - Applied coupon tracking
   - Discount calculation

7. **addressSlice**
   - User addresses
   - Saved for quick checkout

---

## ENUMS & CONSTANTS

### Enums (from `/types/enums.ts`)

```typescript
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  SUCCESS = 'success',
  PENDING = 'pending',
  FAILED = 'failed',
  REFUND = 'refund',
  CANCELLED = 'cancel'
}

export enum RefundStatusEnum {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSED = 'processed'
}

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SPAM = 'spam'
}

export enum AddressType {
  SHIPPING = 'shipping',
  BILLING = 'billing'
}

export enum RefundWindowDays {
  SEVEN = 7,
  FIFTEEN = 15,
  THIRTY = 30,
  CUSTOM = 'custom'
}
```

---

### Constants

**App Routes** (`/constants/AppRoutes.ts`):
```typescript
{
  home: "/",
  contact: "/pages/contact",
  signup: "/pages/signup",
  signin: "/pages/signin",
  blog: "/pages/blog",
  product: "/pages/product",
  cart: "/pages/cart",
  account: "/pages/account",
  forgotPassword: "/pages/forgotpassword",
  resetPassword: "/pages/resetpassword",
  admindashboard: "/pages/admin/dashboard"
}
```

**Refund Config** (`/constants/RefundConfig.ts`):
```typescript
{
  DEFAULT_REFUND_WINDOW_DAYS: 15,
  REFUND_REASONS: [
    'item_damaged',
    'wrong_item',
    'not_as_described',
    'changed_mind',
    'other'
  ],
  getRefundWindowDays(),
  isWithinRefundWindow(),
  getDaysRemainingForRefund()
}
```

---

### Key Configuration Values

**Stripe:**
- Currency: USD (default), INR (for UPI)
- Payment methods: Card, UPI
- Session timeout: Depends on Stripe config

**Supabase Auth:**
- JWT expiry: 3600 seconds (1 hour)
- Refresh token: Automatic refresh
- Email verification: Optional

**Shipping:**
- Default methods: Standard, Express, Overnight
- Cost storage: In cart state & sent to checkout

**Coupons:**
- Type: Fixed amount or percentage
- Min order requirement: Configurable
- Usage limit: Configurable
- Expiration: Configurable

**Refund:**
- Default window: 15 days
- Admin configurable: Via admin_settings table
- Reasons: Damage, Wrong item, Not as described, Changed mind, Other

---

## SECURITY FEATURES

### 1. Authentication
- Supabase managed auth with JWT
- Secure httpOnly cookies
- Session refresh tokens
- Rate limiting on auth endpoints

### 2. Authorization
- RLS on user-private data
- Middleware admin route protection
- Role-based access control (user vs admin)
- Middleware verifies admin role on every request

### 3. Payment Security
- Server-side price calculation (prevents client tampering)
- Stripe tokenization (no card data on server)
- Coupon validation on server
- Payment intent verification before order creation
- Idempotency checks (same session_id = same result)

### 4. Data Validation
- React Hook Form for client validation
- Server-side API validation (not just client)
- Stripe webhook verification (if implemented)
- SQL injection prevention via Supabase SDK

### 5. File Upload
- Supabase Storage (safe upload)
- File type validation
- Size limits (5MB for invoices)
- URL signing for secure access

### 6. Sensitive Operations
- Refund processing requires admin auth
- Settings changes require admin auth
- Review moderation requires admin
- User blocking requires admin

---

## PERFORMANCE OPTIMIZATIONS

1. **Database Indexing:**
   - Orders: user_id, order_date, refund_status
   - Products: category, created_at
   - Addresses: user_id, address_type

2. **Redux Selectors:**
   - Memoized `selectFilteredProducts`
   - Prevent unnecessary renders on state updates

3. **Server Components:**
   - Product listing rendered on server
   - Order history server-paginated
   - Addresses server-paginated

4. **Lazy Loading:**
   - Client components loaded on demand
   - Modal/drawer components lazy

5. **Image Optimization:**
   - Next.js Image component
   - Responsive image sizes
   - WebP format for modern browsers
   - Supabase image optimization (if enabled)

6. **Caching:**
   - Refund window cached in memory (5 min)
   - Browser cache for static assets

---

## ERROR HANDLING & LOGGING

### Error Scenarios

1. **Payment Failures:**
   - Card declined → Show error, allow retry
   - Invalid coupon → API returns 400
   - Payment timeout → Retry mechanism
   - Stripe API down → Show user-friendly error

2. **Database Errors:**
   - Connection lost → Retry with exponential backoff
   - Query timeout → Show error message
   - RLS violation → 403 error

3. **Authentication Errors:**
   - Invalid credentials → "Email or password incorrect"
   - Token expired → Auto-refresh or re-login
   - Session lost → Redirect to login

4. **Validation Errors:**
   - Form validation → Show field-level errors
   - Address validation → Check all required fields
   - Stock unavailable → Show "Out of stock"

### Logging

- Console logs for debugging (dev mode)
- Stripe error logging in console
- Email service error logging
- Admin action logging (audit trail - if implemented)

---

## FUTURE ENHANCEMENTS

1. **Order Tracking**
   - Integration with shipping providers
   - Real-time status updates
   - SMS/Email notifications

2. **Advanced Analytics**
   - Customer lifetime value
   - Product performance metrics
   - Revenue forecasting

3. **Customization**
   - Customer review responses (admin replies to reviews)
   - Gift cards / Store credit
   - Wishlist sharing
   - Email preferences management

4. **Performance**
   - CDN for images
   - Multi-region database replicas
   - Caching layer (Redis)

5. **Features**
   - Product recommendations
   - Customer reviews with verified purchase badge
   - Live chat support
   - Inventory management notifications

---

## TROUBLESHOOTING & KNOWN ISSUES

### Known Issues & Solutions

1. **Refund API shows "No payment intent found"**
   - Cause: Payment record missing transaction_id
   - Solution: Check SQL query in refund route - ensure flexible payment lookup
   - Reference: `/REFUND_QUICK_START.md` (created during refund fix)

2. **Orders page blank**
   - Cause: Schema column mismatch (total_amount vs total_price)
   - Solution: Updated `/app/pages/account/order/page.tsx` with correct column names

3. **Cart not syncing between pages**
   - Cause: Guest cart in localStorage not being loaded
   - Solution: Call `loadGuestCart()` action on app initialization
   - Reference: `Store/StoreProvider.tsx` subscribes to Supabase auth state

4. **Admin role not recognized**
   - Cause: RPC function `is_admin` not finding admin role
   - Solution: Verify profile.role = 'admin' in database
   - Check: `middleware.ts` and `authSlice.checkIsAdmin`

---

## MONITORING & MAINTENANCE

### Regular Tasks

1. **Weekly:**
   - Review failed payments / error logs
   - Check refund requests queue

2. **Monthly:**
   - Review product performance
   - Analyze customer feedback
   - Check server logs

3. **Quarterly:**
   - Database optimization (indexing, vacuuming)
   - Security audit
   - Backup verification

---

## APPENDIX: QUICK REFERENCE

### File Organization Map

```
📦 Propelius E-Commerce
├── 📂 app/
│   ├── api/ (API routes)
│   ├── pages/ (Main pages)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx (Home)
├── 📂 store/ (Redux)
│   ├── slices/
│   └── hooks.ts
├── 📂 components/ (Reusable components)
├── 📂 sections/ (Page sections)
├── 📂 form/ (Form components)
├── 📂 lib/ (Utilities & services)
├── 📂 types/ (TypeScript definitions)
├── 📂 constants/ (Constants & routes)
├── 📂 supabase/ (Database schema)
├── 📂 public/ (Static assets)
└── 📂 middleware.ts (Route protection)
```

### Critical Files for Each Feature

| Feature | Key Files |
|---------|-----------|
| Auth | `authSlice.ts`, `/api/auth/signup`, `middleware.ts` |
| Cart | `cartSlice.ts`, `ShoppingCart.tsx`, `AddToCartButton.tsx` |
| Checkout | `/api/stripe/checkout`, `/api/stripe/confirm`, Checkout...tsx files |
| Refund | `/api/stripe/refund`, `RefundConfig.ts` |
| Admin | `middleware.ts`, `/pages/admin/*` |

---

**END OF DETAILED REPORT**

Generated: March 23, 2026
Document Version: 1.0
Total Pages: 60+
Total Sections: 100+

