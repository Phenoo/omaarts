export type UserRole = 'customer' | 'staff' | 'admin' | 'super_admin';

export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

export interface ActivityVariant {
  id: string;
  name: string;
  price: number; // in NGN
  description?: string;
}

export type PricingModel = 'FIXED' | 'PER_PERSON' | 'PER_HOUR' | 'TIERED' | 'VARIANT' | 'BOOKING_ONLY' | 'CUSTOM_QUOTE';

export interface Activity {
  id: string; // matches document ID and serves as identifier (e.g., paint-and-sip)
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  images: string[];
  basePrice: number; // in NGN
  currency: "NGN";
  pricingModel: PricingModel;
  variants: ActivityVariant[];
  priceUnit?: string; // e.g. "per person", "per hour", "per unit/person"
  duration: string; // e.g. "2 hours", "1 hour"
  complimentaryItems: string[];
  category: string;
  active: boolean;
  featured: boolean;
  bookingEnabled: boolean;
  sortOrder: number;
  complimentaryText?: string; // e.g. "Complimentary Drinks, Music and Games"
  createdAt: string;
  updatedAt: string;
}

export type ArtworkStatus = 'AVAILABLE' | 'SOLD' | 'PORTFOLIO_ONLY' | 'RESERVED' | 'COMMISSIONED' | 'ARCHIVED';

export interface Artwork {
  id: string; // matches document ID, e.g. artwork-slug
  title: string;
  slug: string;
  description: string;
  story?: string;
  artist: string;
  year: string;
  medium: string;
  dimensions: string;
  categoryId: string; // references category
  images: string[];
  price: number; // in NGN
  currency: "NGN";
  inventoryQty: number; // For 1-of-1 artworks, this is strictly 1 or 0
  availableForSale: boolean;
  featured: boolean;
  status: ArtworkStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'artwork' | 'activity';
  slug: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface Booking {
  id: string;
  bookingNumber: string; // human-readable invoice style like PSB-2026-XXXX
  userId?: string; // optional user account ID
  customerName: string;
  email: string;
  phone: string;
  activityId: string;
  activitySnapshot: {
    name: string;
    basePrice: number;
    pricingModel: PricingModel;
  };
  variant: ActivityVariant | null;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  numberOfGuests: number;
  specialRequests?: string;
  bookingNotes?: string;
  subtotal: number;
  total: number;
  currency: 'NGN';
  paymentMode?: 'PAYSTACK' | 'ENQUIRY';
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  paystackReference?: string;
  createdAt: string;
  updatedAt: string;
}

export type FulfilmentStatus =
  | 'PENDING'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface OrderItem {
  artworkId: string;
  title: string;
  price: number; // in NGN
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string; // human-readable code like PSO-2026-XXXX
  userId?: string;
  customerName: string;
  email: string;
  phone: string;
  deliveryOption: 'pickup' | 'delivery';
  deliveryAddress?: string;
  orderNotes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: 'NGN';
  paymentStatus: PaymentStatus;
  fulfilmentStatus: FulfilmentStatus;
  paystackReference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string; // matches reference or auto-id
  reference: string;
  orderId?: string;
  bookingId?: string;
  customerId?: string;
  amount: number; // stored in kobo/minor units or direct Naira? Let's use Naira (integer major units) but verify conversion when interfacing with Paystack
  currency: 'NGN';
  status: 'success' | 'failed' | 'pending';
  provider: 'paystack';
  channel?: string;
  paidAt?: string;
  verifiedAt?: string;
  createdAt: string;
}

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'POS' | 'PAYSTACK' | 'OTHER';
export type SaleType = 'ONLINE' | 'MANUAL';
export type SaleCategory = 'ARTWORK' | 'ACTIVITY' | 'OTHER';

export interface Sale {
  id: string;
  invoiceNumber: string;
  type: SaleType;
  category: SaleCategory;
  referenceId?: string; // references bookingId, orderId, or blank if manual
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  paymentMethod: PaymentMethod;
  recordedBy: string; // UID or email of admin/staff
  notes?: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface BlockedDate {
  id: string;
  date: string; // YYYY-MM-DD
  reason: string;
  isFullClosure: boolean;
  blockedSlots: string[]; // empty if full day is closed
}

export interface Enquiry {
  id: string;
  type: 'corporate' | 'space';
  name: string;
  company?: string;
  email: string;
  phone: string;
  eventType: string;
  numberOfGuests: number;
  preferredDate: string;
  preferredTime: string;
  activityInterests?: string[];
  message: string;
  status: 'PENDING' | 'REVIEWED' | 'ARCHIVED';
  createdAt: string;
}

export interface SiteSettings {
  id: 'general';
  businessName: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  socialUrls: {
    instagram: string;
    twitter: string;
    linkedin: string;
    tiktok: string;
  };
  currency: 'NGN';
  bookingPolicy: string;
  cancellationPolicy: string;
  damagePolicy: string;
  businessHours: string;
  deliveryFeeDefault: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  text: string;
  rating: number;
  active: boolean;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  caption?: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface InventoryMovement {
  id: string;
  artworkId: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string; // e.g. "SEEDED", "ONLINE_PURCHASE", "MANUAL_SALE", "CORRECTION"
  description?: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  adminUid: string;
  action: string; // e.g. "PRICE_CHANGED", "ARTWORK_CREATED", "BOOKING_CANCELLED"
  resourceType: 'activity' | 'artwork' | 'booking' | 'order' | 'sale' | 'settings';
  resourceId: string;
  beforeInfo?: Record<string, unknown>;
  afterInfo?: Record<string, unknown>;
  timestamp: string;
}

export interface ActivityPriceHistory {
  id: string;
  resourceType: 'activity';
  resourceId: string;
  oldPrice: number;
  newPrice: number;
  changedBy: string; // admin/staff email or uid
  reason?: string;
  timestamp: string;
}
