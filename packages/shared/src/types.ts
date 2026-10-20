export type OrderStatus =
  | 'new_request'
  | 'contacted'
  | 'quoted'
  | 'confirmed'
  | 'dispatched'
  | 'completed'
  | 'cancelled';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  productCount?: number;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  indicativePrice?: number | null;
  skuSuffix?: string;
}

export interface BulkPriceTier {
  min_qty: number;
  unit_price: number;
}

export interface PackagingOption {
  name: string;
  price: number;
  included: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  images: string[];
  material: string | null;
  dimensions: string | null;
  hasVariants: boolean;
  variants: ProductVariant[];
  indicativePrice: number | null;
  minQuantity: number;
  availabilityLabel: string;
  customisationInfo: string | null;
  status: 'draft' | 'published' | 'archived';
  isDemo: boolean;
  priceType?: 'piece' | 'set';
  setContents?: string | null;
  orderIncrement?: number;
  isQuoteOnly?: boolean;
  bulkTiers?: BulkPriceTier[];
  packagingOptions?: PackagingOption[];
  shippingInfo?: string;
  occasions?: string[];
  supportsIndividual?: boolean;
  supportsBulk?: boolean;
  deity?: string | null;
  frameSize?: string | null;
  orientation?: 'portrait' | 'landscape' | 'square';
  borderFinish?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemInput {
  productId: string;
  productSku?: string;
  productName?: string;
  selectedVariant?: string | null;
  quantity: number;
  customisationNote?: string;
}

export interface OrderSubmissionPayload {
  idempotencyKey: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPincode: string;
  customerNotes?: string;
  occasion?: string | null;
  requiredDate?: string | null;
  isBulkRequest?: boolean;
  items: OrderItemInput[];
}

export interface OrderItemSnapshot {
  id: string;
  orderId: string;
  productId: string;
  productSku: string;
  productName: string;
  selectedVariant: string | null;
  quantity: number;
  snapshotIndicativePrice: number | null;
  snapshotImageUrl: string | null;
  customisationNote: string | null;
  // Aliases for template convenience
  sku?: string;
  name?: string;
  variant?: string | null;
  imageUrl?: string | null;
  indicativePrice?: number | null;
}

export interface QuotedItem {
  productId: string;
  productName: string;
  quantity: number;
  agreedUnitPrice: number;
  customisationNote?: string;
}

export interface OrderQuotation {
  id: string;
  orderId: string;
  revisionNumber: number;
  items: QuotedItem[];
  itemsSubtotal: number;
  shippingCharge: number;
  taxAmount: number;
  totalQuotedAmount: number;
  quotationNotes: string | null;
  notes?: string | null;
  createdByAdmin: string;
  createdAt: string;
}

export interface OrderInternalNote {
  id: string;
  orderId: string;
  adminId: string;
  adminName: string;
  note: string;
  createdAt: string;
}

export interface Order {
  id: string;
  idempotencyKey: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPincode: string;
  customerNotes: string | null;
  occasion?: string | null;
  requiredDate?: string | null;
  isBulkRequest?: boolean;
  status: OrderStatus;
  initialIndicativeSubtotal: number | null;
  indicativeSubtotal?: number | null;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
  items?: OrderItemSnapshot[];
  quotations?: OrderQuotation[];
  internalNotes?: OrderInternalNote[]; // Never sent to customer API
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  role: 'customer' | 'admin';
  createdAt: string;
}

export type SessionScope = 'customer' | 'admin';

export interface Session {
  id: string;
  userId: string;
  scope: SessionScope;
  expiresAt: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  slug: string;
  image: string;
  indicativePrice: number | null;
  minQuantity: number;
  quantity: number;
  selectedVariant?: string | null;
  customisationNote?: string;
  priceType?: 'piece' | 'set';
  orderIncrement?: number;
  isQuoteOnly?: boolean;
  setContents?: string | null;
  packagingOption?: string | null;
  deity?: string | null;
  frameSize?: string | null;
  orientation?: 'portrait' | 'landscape' | 'square';
}

export interface CampaignBanner {
  id: string;
  badge?: string | null;
  headline: string;
  emphasis?: string | null;
  supporting?: string | null;
  ctaText: string;
  ctaHref: string;
  desktopImage: string;
  mobileImage: string;
  alt?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

