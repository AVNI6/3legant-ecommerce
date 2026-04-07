export interface ConfirmBody {
  sessionId?: string;
}

export interface CancelBody {
  sessionId?: string;
}

export interface CheckoutItem {
  id: number;
  variant_id?: number;
  name: string;
  price: number;
  quantity: number;
  color: string;
  image: string;
}

export interface CartSnapshotItem {
  id: number;
  variant_id?: number;
  name: string;
  price: number;
  quantity: number;
  color: string;
  image: string;
}

export interface CheckoutAddress {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface PaymentDetails {
  cartSnapshot?: CartSnapshotItem[];
  shippingAddress?: CheckoutAddress;
  billingAddress?: CheckoutAddress;
  shippingAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  country?: string;
  couponCode?: string;
  shippingMethod?: string;
}

export interface CheckoutRequestBody {
  items: CheckoutItem[];
  shippingAddress: CheckoutAddress;
  billingAddress?: CheckoutAddress;
  couponCode?: string;
  totalAmount?: number;
}

// Invoice types
export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface InvoiceAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface InvoiceOrder {
  id: number;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  shippingAddress: InvoiceAddress;
  billingAddress?: InvoiceAddress;
}

export interface InvoiceEmailArgs {
  orderId: number;
  recipientEmail: string;
  invoiceUrl: string;
}
