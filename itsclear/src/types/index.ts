export type ProductCategory = 
  | 'sharbati' 
  | 'khapli' 
  | 'multigrain' 
  | 'specialty'
  | 'wellness' 
  | 'gluten-free' 
  | 'heritage'
  | 'atta'
  | 'oil'
  | 'ghee'
  | 'combos'
  | 'combo'
  | 'rice'
  | 'dal'
  | 'spices';

export interface GalleryItem {
  id: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  sku?: string;
  barcode?: string;
  size: string; // e.g. "5 Kg Jute Sack", "1 Litre Bottle", "500g Glass Jar"
  unit?: string; // "kg" | "g" | "L" | "ml" | "pack"
  weightInKg?: number;
  volumeInMl?: number;
  price: number;
  originalPrice: number;
  inStock: boolean;
  stockCount: number;
  reservedStock?: number;
  lowStockThreshold?: number;
  imageUrl?: string;
}

export interface ProductNutrition {
  energy: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber?: string;
  iron?: string;
  glutenIndex?: string;
  glycemicIndex?: string;
  saturatedFat?: string;
  monounsaturatedFat?: string;
  polyunsaturatedFat?: string;
  transFat?: string;
  cholesterol?: string;
  [key: string]: string | undefined;
}

export interface Product {
  id: string;
  name: string;
  subTitle?: string;
  category: ProductCategory;
  categoryId?: string;
  status?: 'draft' | 'published' | 'archived';
  sortOrder?: number;
  relatedProductIds?: string[];
  customAttributes?: Record<string, any>;
  tagline: string;
  description: string;
  origin: string; // e.g. "Sehore, Madhya Pradesh"
  harvestSeason: string;
  labTestBatch: string;
  purityScore: number; // e.g. 99.9%
  featured: boolean;
  isActive?: boolean;
  rating: number;
  reviewCount: number;
  images: string[];
  gallery?: GalleryItem[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  modelType: 'atta-sack' | 'atta-kraft' | 'atta-pouch' | 'atta-tin' | 'atta-eco-box' | 'oil-bottle' | 'ghee-jar' | 'rice-bag' | 'spice-tin' | 'dal-jar';
  themeColor: string; // Accent color for 3D model packaging
  secondaryColor: string;
  flourType?: string; // e.g. "Stoneground Chakki Whole Grain"
  millingSpeed?: string; // e.g. "Slow Cold Milling < 28°C"
  rotiSoftnessScore?: number; // 1-10
  extractionMethod?: string; // e.g. "Traditional Wooden Kohlu Cold-Pressed (Kachi Ghani)"
  seedVariety?: string; // e.g. "Grade-1 Natural Mustard Seeds"
  churningMethod?: string; // e.g. "Traditional Bilona Hand-Churned Method"
  gheeTexture?: string; // e.g. "Golden Danedaar (Granular)"
  storageInstructions?: string; // e.g. "Store in a cool dry place, away from sunlight"
  smokePoint?: string; // e.g. "High Smoke Point 250°C"
  comboItems?: string[]; // e.g. ["5 kg Khapli Atta", "1 L Cold Pressed Mustard Oil"]
  composition?: string; // e.g. "60% Wheat Atta, 30% Soya Flour, 10% Peanut"
  packageBadges?: string[]; // e.g. ["High Protein", "Rich in Nutrition", "Good for Health"]
  variants: ProductVariant[];
  nutrition: ProductNutrition;
  benefits: string[];
  certifications: string[];
}

export interface CartItem {
  product: Product;
  selectedVariant: ProductVariant;
  quantity: number;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  addressLine1?: string;
  addressLine2?: string;
  apartment?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  type: 'home' | 'work' | 'farm';
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  coinsUsed?: number;
  coinsDiscount?: number;
  coinsEarned?: number;
  tax: number;
  deliveryFee: number;
  ecoPackaging?: boolean;
  gstin?: string;
  total: number;
  shippingAddress: Address;
  deliverySlot: string;
  paymentMethod: 'upi' | 'card' | 'cod' | 'netbanking';
  paymentStatus: 'paid' | 'pending' | 'authorized' | 'failed' | 'refunded';
  paymentProvider?: string;
  providerOrderId?: string;
  providerPaymentId?: string;
  orderStatus: 'confirmed' | 'milling' | 'quality_check' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'return_requested' | 'returned';
  estimatedDelivery: string;
  trackingStep: number; // 0 to 5
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  millingDate?: string;
  cancelReason?: string;
  cancelledAt?: string;
  returnReason?: string;
  returnRequestedAt?: string;
  refundStatus?: 'none' | 'refund_initiated' | 'pickup_scheduled' | 'refunded';
}

export interface UserReview {
  id: string;
  productId: string;
  userName: string;
  userCity: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed' | 'flat';
  discountValue: number;
  minOrderValue: number;
  description: string;
  validFrom?: string | null;
  validUntil?: string | null;
  usageLimit?: number;
  usedCount?: number;
  applicableCategories?: string[];
  canStackWithCoins?: boolean;
  canStackWithCombos?: boolean;
  active?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  clearCoins: number;
  amritCoins?: number;
  membershipTier: 'Silver Grain' | 'Gold Harvester' | 'Platinum Kisan Mitra';
  createdAt?: string;
}

// ─────────────────────────────────────────────────────────────
// ADMIN 2.0 TYPES & INTERFACES
// ─────────────────────────────────────────────────────────────

export interface CategoryAttributeDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  eligibleForSubscription: boolean;
  attributeSchema: CategoryAttributeDefinition[];
  seo?: {
    title: string;
    description: string;
  };
  productCount?: number;
}

export interface InventoryItem {
  productId: string;
  productName: string;
  category: string;
  imageUrl: string;
  variantId: string;
  sku: string;
  size: string;
  price: number;
  stockCount: number;
  inStock: boolean;
  lowStockThreshold: number;
  isLowStock: boolean;
}

export interface InventoryLog {
  id?: string;
  productId: string;
  productName: string;
  variantId: string;
  sku: string;
  previousStock: number;
  newStock: number;
  changeAmount: number;
  actionType: 'manual_adjustment' | 'order_sale' | 'order_cancellation_restock' | 'return_restock' | 'bulk_import';
  reason: string;
  performedBy: {
    userId?: string | null;
    name: string;
    email: string;
  };
  orderId?: string | null;
  createdAt: string;
}

export interface HeroBannerSlide {
  id: string;
  badge?: string;
  headline: string;
  subtitle: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  imageUrl: string;
  isActive: boolean;
}

export interface HomepageSectionConfig {
  id: string;
  name: string;
  isVisible: boolean;
  sortOrder: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  discountPercentage: number;
  eligibleCategories: string[];
  description: string;
  isActive: boolean;
}

export interface StoreSettings {
  delivery: {
    freeDeliveryThreshold: number;
    standardDeliveryFee: number;
    expressDeliveryFee: number;
    deliverySlots: string[];
    serviceableCities: string[];
  };
  payments: {
    onlinePaymentsEnabled: boolean;
    codEnabled: boolean;
    codMaxOrderValue: number;
    razorpayKeyId?: string;
  };
  storeProfile: {
    brandName: string;
    legalEntityName: string;
    gstin: string;
    fssaiLicense: string;
    supportPhone: string;
    supportEmail: string;
    warehouseAddress: string;
  };
  grainClub: {
    coinsPerHundredSpent: number;
    maxCoinsRedeemPercent: number;
  };
}

export interface AdminMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  pendingFulfillment: number;
  completedOrders: number;
  statusCounts: Record<string, number>;
  lowStockCount: number;
  recentOrders: Order[];
}
