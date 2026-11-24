import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, ProductVariant, Order, Address, UserReview, Coupon } from '../types';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, SAMPLE_REVIEWS } from '../data/products';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  saveForLater: CartItem[];
  buyNowItem: CartItem | null;
  wishlist: string[];
  orders: Order[];
  coupons: Coupon[];
  appliedCoupon: { code: string; discountAmount: number; freeShipping?: boolean } | null;
  savedAddresses: Address[];
  selectedAddress: Address | null;
  deliverySlot: string;
  ecoPackaging: boolean;
  useClearCoins: boolean;
  reviews: UserReview[];
  notifications: ToastNotification[];
  isCartDrawerOpen: boolean;
  // Auth state
  isAuthenticated: boolean;
  currentUser: {
    id: string;
    name: string;
    email: string;
    phone: string;
    city?: string;
    clearCoins: number;
    membershipTier: 'Silver Grain' | 'Gold Harvester' | 'Platinum Kisan Mitra';
    createdAt?: string;
  } | null;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  pendingCartAction: { product: Product; variant: ProductVariant; quantity: number } | null;

  user: {
    name: string;
    email: string;
    phone: string;
    clearCoins: number;
    amritCoins: number;
    membershipTier: 'Silver Grain' | 'Gold Harvester' | 'Platinum Kisan Mitra';
  };

  // Admin
  isAdminAuthenticated: boolean;
  loginAdmin: (email: string, password: string) => Promise<boolean>;
  loginAdminWithGoogle: (credential: string) => Promise<boolean>;
  loginAdminWithOtp: (email: string, otp: string) => Promise<boolean>;
  logoutAdmin: () => void;
  updateAdminPassword: (newPass: string) => Promise<void>;

  // Actions
  login: (emailOrPhone: string, passwordOrName?: string) => Promise<boolean>;
  loginWithOtp: (email: string, otp: string) => Promise<boolean>;
  sendLoginOtp: (email: string) => Promise<{ success: boolean; message: string; expiresIn: number; resendAfter: number; devOtp?: string }>;
  loginWithGoogle: (credential: string) => Promise<{ success: boolean; requiresLinking?: boolean; email?: string; name?: string; message?: string }>;
  linkGoogleAccount: (credential: string, opts: { password?: string; otp?: string }) => Promise<boolean>;
  register: (userData: { name: string; email: string; phone: string; city: string; password?: string }) => Promise<boolean>;
  verifyRegistrationOtp: (email: string, otp: string, cityName?: string) => Promise<any>;
  logout: () => void;
  openAuthModal: (tab?: 'login' | 'register', pendingAction?: { product: Product; variant: ProductVariant; quantity: number }) => void;
  closeAuthModal: () => void;
  setIsCartDrawerOpen: (open: boolean) => void;
  addToCart: (product: Product, variant: ProductVariant, quantity?: number, bypassAuthCheck?: boolean) => void;
  removeFromCart: (variantId: string) => void;
  updateCartQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  moveToSaveForLater: (variantId: string) => void;
  moveToCartFromSaved: (variantId: string) => void;
  removeFromSavedForLater: (variantId: string) => void;
  startBuyNow: (product: Product, variant: ProductVariant, quantity?: number) => void;
  clearBuyNow: () => void;
  toggleWishlist: (productId: string) => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  setSelectedAddress: (address: Address) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  deleteAddress: (id: string) => void;
  setDeliverySlot: (slot: string) => void;
  setEcoPackaging: (eco: boolean) => void;
  setUseClearCoins: (use: boolean) => void;
  placeOrder: (details: {
    deliverySlot: string;
    paymentMethod: 'upi' | 'card' | 'cod' | 'netbanking';
    address: Address;
    gstin?: string;
  }, paymentProof?: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) => Promise<Order>;
  preparePayment: (details: {
    deliverySlot: string;
    paymentMethod: 'upi' | 'card' | 'netbanking';
    address: Address;
    gstin?: string;
  }) => Promise<{ keyId: string; providerOrderId: string; amount: number; currency: string }>;
  updateOrderStatus: (orderId: string, status: Order['orderStatus']) => Promise<void>;
  cancelOrder: (orderId: string, reason: string) => Promise<void>;
  requestReturn: (orderId: string, reason: string) => Promise<void>;
  addProduct: (newProduct: Product) => Promise<void>;
  updateProduct: (updated: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addReview: (review: Omit<UserReview, 'id' | 'date'>) => void;
  notify: (title: string, message: string, type?: ToastNotification['type']) => void;
  dismissNotification: (id: string) => void;

  // Computed values (automatically reflect buyNowItem if active, otherwise cart)
  activeCheckoutItems: CartItem[];
  cartItemCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  coinsToRedeem: number;
  coinsDiscount: number;
  deliveryFee: number;
  cartTax: number;
  cartTotal: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Clean initial state (no hardcoded personal details leaked to new visitors)
const INITIAL_ADDRESSES: Address[] = [];
const INITIAL_ORDERS: Order[] = [];

// Purge any legacy browser caches
if (typeof window !== 'undefined') {
  try {
    const legacyKeys = [
      'itsclear_products',
      'itsclear_products_v1',
      'itsclear_products_v2',
      'itsclear_products_v3',
      'itsclear_products_v4',
      'itsclear_products_v5',
      'itsclear_products_v6'
    ];
    legacyKeys.forEach(k => localStorage.removeItem(k));
    ['itsclear_cart_v2', 'itsclear_wishlist_v2'].forEach(k => {
      const val = localStorage.getItem(k);
      if (val && (/[\u0900-\u097F]/.test(val) || val.includes('sharbati-gold'))) {
        localStorage.removeItem(k);
      }
    });
  } catch (e) {
    // ignore
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem('itsclear_products_v12');
      if (stored) {
        if (/[\u0900-\u097F]/.test(stored) || stored.includes('sharbati-gold')) {
          localStorage.removeItem('itsclear_products_v12');
          return INITIAL_PRODUCTS;
        }
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id.startsWith('itsclear-')) {
          return parsed;
        }
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('itsclear_cart_v4') || localStorage.getItem('itsclear_cart_v3');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save for Later (Flipkart style)
  const [saveForLater, setSaveForLater] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('itsclear_saved_later_v1');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Isolated Single-Item Buy Now Session (Flipkart style)
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);

  // Delivery Slot & Eco Packaging persisted across CartPage -> CheckoutPage
  const [deliverySlot, setDeliverySlot] = useState<string>('2-Hour Farm Express');
  const [ecoPackaging, setEcoPackaging] = useState<boolean>(true);
  const [useClearCoins, setUseClearCoins] = useState<boolean>(false);

  // Coupons synced from backend
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('itsclear_wishlist_v4') || localStorage.getItem('itsclear_wishlist_v3');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Orders (user-scoped)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem('itsclear_orders_v4');
      return stored ? JSON.parse(stored) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Addresses (user-scoped, no hardcoded personal data)
  const [savedAddresses, setSavedAddresses] = useState<Address[]>(() => {
    try {
      const stored = localStorage.getItem('itsclear_addresses_v4');
      return stored ? JSON.parse(stored) : INITIAL_ADDRESSES;
    } catch {
      return INITIAL_ADDRESSES;
    }
  });

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    savedAddresses.find(a => a.isDefault) || savedAddresses[0] || null
  );

  // Reviews
  const [reviews, setReviews] = useState<UserReview[]>(() => {
    try {
      const stored = localStorage.getItem('itsclear_reviews_v4');
      return stored ? JSON.parse(stored) : SAMPLE_REVIEWS;
    } catch {
      return SAMPLE_REVIEWS;
    }
  });

  // Auth states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem('itsclear_jwt_token')) && localStorage.getItem('itsclear_auth_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem('itsclear_admin_jwt_token')) && localStorage.getItem('itsclear_admin_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    city?: string;
    clearCoins: number;
    membershipTier: 'Silver Grain' | 'Gold Harvester' | 'Platinum Kisan Mitra';
    createdAt?: string;
  } | null>(() => {
    try {
      const stored = localStorage.getItem('itsclear_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // LocalStorage persistence
  useEffect(() => {
    try { localStorage.setItem('itsclear_cart_v4', JSON.stringify(cart)); } catch {}
  }, [cart]);

  useEffect(() => {
    try { localStorage.setItem('itsclear_saved_later_v1', JSON.stringify(saveForLater)); } catch {}
  }, [saveForLater]);

  useEffect(() => {
    try { localStorage.setItem('itsclear_wishlist_v4', JSON.stringify(wishlist)); } catch {}
  }, [wishlist]);

  useEffect(() => {
    try { localStorage.setItem('itsclear_addresses_v4', JSON.stringify(savedAddresses)); } catch {}
  }, [savedAddresses]);

  useEffect(() => {
    try { localStorage.setItem('itsclear_orders_v4', JSON.stringify(orders)); } catch {}
  }, [orders]);

  useEffect(() => {
    try { localStorage.setItem('itsclear_reviews_v4', JSON.stringify(reviews)); } catch {}
  }, [reviews]);

  // Helper to refresh user-scoped orders
  const syncOrdersFromServer = (isAdmin: boolean, userId?: string) => {
    if (!isAdmin && !userId) return;
    api.getOrders(isAdmin ? undefined : userId, isAdmin)
      .then(fetchedOrders => {
        if (Array.isArray(fetchedOrders)) {
          setOrders(fetchedOrders);
          try { localStorage.setItem('itsclear_orders_v4', JSON.stringify(fetchedOrders)); } catch {}
        }
      })
      .catch(err => {
        console.warn('Order sync notice:', err.message);
      });
  };

  // Initial Real-time Database Sync
  useEffect(() => {
    let isMounted = true;

    api.getProducts()
      .then(fetchedProducts => {
        if (isMounted && Array.isArray(fetchedProducts) && fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
          try { localStorage.setItem('itsclear_products_v12', JSON.stringify(fetchedProducts)); } catch {}
        }
      })
      .catch(err => console.warn('API sync products:', err.message));

    api.getCoupons()
      .then(fetchedCoupons => {
        if (isMounted && Array.isArray(fetchedCoupons) && fetchedCoupons.length > 0) {
          setCoupons(fetchedCoupons);
        }
      })
      .catch(() => {});

    api.getReviews()
      .then(fetchedReviews => {
        if (isMounted && Array.isArray(fetchedReviews) && fetchedReviews.length > 0) {
          const normalized = fetchedReviews.map((r: any) => ({
            id: r.id,
            productId: r.productId,
            userName: r.userName || r.author || 'Verified Customer',
            userCity: r.userCity || r.city || 'India',
            rating: Number(r.rating || 5),
            comment: r.comment,
            date: r.date || new Date().toISOString().split('T')[0],
            verifiedPurchase: Boolean(r.verifiedPurchase ?? r.verified)
          }));
          setReviews(normalized);
        }
      })
      .catch(() => {});

    api.getCurrentUser()
      .then(res => {
        if (isMounted && res) {
          const userData = res.user || res;
          if (userData && (userData.id || userData.email)) {
            setCurrentUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('itsclear_current_user', JSON.stringify(userData));
            syncOrdersFromServer(false, userData.id);
          }
        }
      })
      .catch(() => {});

    if (isAdminAuthenticated) {
      syncOrdersFromServer(true);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; freeShipping?: boolean } | null>(null);
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const notify = (title: string, message: string, type: ToastNotification['type'] = 'info') => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    setNotifications(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => dismissNotification(id), 4500);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const loginAdmin = async (email: string, enteredPassword: string): Promise<boolean> => {
    try {
      const res = await api.adminLogin(email, enteredPassword);
      if (res && res.token) {
        setIsAdminAuthenticated(true);
        localStorage.setItem('itsclear_admin_logged_in', 'true');
        syncOrdersFromServer(true);
        notify('Admin Access Granted', 'Authenticated with live itsclear Enterprise Database.', 'success');
        return true;
      }
    } catch (e: any) {
      notify('Access Denied', e.message || 'Invalid Admin Password.', 'error');
      return false;
    }
    notify('Access Denied', 'Invalid Admin Password.', 'error');
    return false;
  };

  const loginAdminWithGoogle = async (credential: string): Promise<boolean> => {
    try {
      const res = await api.googleAuth(credential, 'admin');
      if (res && res.token && res.user && res.user.role === 'admin') {
        setIsAdminAuthenticated(true);
        localStorage.setItem('itsclear_admin_logged_in', 'true');
        syncOrdersFromServer(true);
        notify('Admin Access Granted', `Authenticated via Google as ${res.user.name}.`, 'success');
        return true;
      }
      notify('Admin Access Denied', 'Your Google account is not authorized for administrator access.', 'error');
      return false;
    } catch (e: any) {
      notify('Admin Access Denied', e.message || 'Unauthorized administrator account.', 'error');
      return false;
    }
  };

  const loginAdminWithOtp = async (email: string, otp: string): Promise<boolean> => {
    try {
      const res = await api.verifyLoginOtp(email, otp, 'admin');
      if (res && res.token && res.user && res.user.role === 'admin') {
        setIsAdminAuthenticated(true);
        localStorage.setItem('itsclear_admin_logged_in', 'true');
        syncOrdersFromServer(true);
        notify('Admin Access Granted', `Authenticated via Email OTP as ${res.user.name}.`, 'success');
        return true;
      }
      notify('Admin Access Denied', 'Your account is not authorized for administrator access.', 'error');
      return false;
    } catch (e: any) {
      notify('Admin Access Denied', e.message || 'Could not verify admin OTP.', 'error');
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('itsclear_admin_logged_in');
    localStorage.removeItem('itsclear_admin_jwt_token');
    notify('Admin Logged Out', 'Admin session terminated safely.', 'info');
  };

  const updateAdminPassword = async (newPass: string) => {
    if (!newPass || newPass.trim().length < 12) {
      notify('Password Too Short', 'Admin password must be at least 12 characters.', 'warning');
      return;
    }
    try {
      await api.adminChangePassword(newPass.trim());
      notify('Admin Password Updated', 'Your new admin password has been saved securely in the database.', 'success');
    } catch (err: any) {
      notify('Update Failed', err.message || 'Could not update admin password.', 'error');
    }
  };

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [pendingCartAction, setPendingCartAction] = useState<{
    product: Product;
    variant: ProductVariant;
    quantity: number;
  } | null>(null);

  const user = currentUser
    ? {
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        clearCoins: currentUser.clearCoins,
        amritCoins: currentUser.clearCoins,
        membershipTier: currentUser.membershipTier
      }
    : {
        name: 'Guest Shopper',
        email: '',
        phone: '',
        clearCoins: 0,
        amritCoins: 0,
        membershipTier: 'Silver Grain' as const
      };

  const openAuthModal = (
    tab: 'login' | 'register' = 'login',
    pendingAction?: { product: Product; variant: ProductVariant; quantity: number }
  ) => {
    setAuthModalTab(tab);
    if (pendingAction) setPendingCartAction(pendingAction);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const executeAddToCart = (product: Product, variant: ProductVariant, quantity: number = 1) => {
    setBuyNowItem(null); // Clear isolated Buy Now when explicitly adding to cart
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        item => item.product.id === product.id && item.selectedVariant.id === variant.id
      );
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = { ...updated[existingIndex], quantity: updated[existingIndex].quantity + quantity };
        return updated;
      }
      return [...prevCart, { product, selectedVariant: variant, quantity }];
    });
    notify('Added to Basket', `${product.name} (${variant.size}) added to your fresh chakki basket!`, 'success');
  };

  const addToCart = (product: Product, variant: ProductVariant, quantity: number = 1) => {
    executeAddToCart(product, variant, quantity);
  };

  // Flipkart-style isolated Buy Now (does not mix with existing cart)
  const startBuyNow = (product: Product, variant: ProductVariant, quantity: number = 1) => {
    setBuyNowItem({ product, selectedVariant: variant, quantity });
    setAppliedCoupon(null);
  };

  const clearBuyNow = () => {
    setBuyNowItem(null);
  };

  // Save for Later actions
  const moveToSaveForLater = (variantId: string) => {
    const item = cart.find(i => i.selectedVariant.id === variantId);
    if (!item) return;
    setCart(prev => prev.filter(i => i.selectedVariant.id !== variantId));
    setSaveForLater(prev => {
      if (prev.some(i => i.selectedVariant.id === variantId)) return prev;
      return [item, ...prev];
    });
    notify('Saved for Later', `${item.product.name} moved to Save for Later.`, 'info');
  };

  const moveToCartFromSaved = (variantId: string) => {
    const item = saveForLater.find(i => i.selectedVariant.id === variantId);
    if (!item) return;
    setSaveForLater(prev => prev.filter(i => i.selectedVariant.id !== variantId));
    executeAddToCart(item.product, item.selectedVariant, item.quantity);
  };

  const removeFromSavedForLater = (variantId: string) => {
    setSaveForLater(prev => prev.filter(i => i.selectedVariant.id !== variantId));
  };

  const login = async (emailOrPhone: string, passwordOrName?: string): Promise<boolean> => {
    try {
      const res = await api.login(emailOrPhone, passwordOrName || '');
      if (res && res.user) {
        const userProfile = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          phone: res.user.phone,
          city: res.user.city || 'Lucknow',
          clearCoins: res.user.clearCoins ?? 250,
          membershipTier: res.user.membershipTier || ('Silver Grain' as const),
          createdAt: res.user.createdAt || new Date().toISOString()
        };
        setCurrentUser(userProfile);
        setIsAuthenticated(true);
        localStorage.setItem('itsclear_auth_logged_in', 'true');
        localStorage.setItem('itsclear_current_user', JSON.stringify(userProfile));
        syncOrdersFromServer(false, userProfile.id);

        if (pendingCartAction) {
          executeAddToCart(pendingCartAction.product, pendingCartAction.variant, pendingCartAction.quantity);
          setPendingCartAction(null);
        } else {
          notify('Welcome Back!', `Signed in successfully as ${userProfile.name}.`, 'success');
        }
        setIsAuthModalOpen(false);
        return true;
      }
      return false;
    } catch (err: any) {
      notify('Sign In Failed', err.message || 'Invalid email/phone or password.', 'error');
      throw err;
    }
  };

  const loginWithOtp = async (email: string, otp: string): Promise<boolean> => {
    try {
      const res = await api.verifyLoginOtp(email, otp);
      if (!res?.user) return false;
      const userProfile = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        phone: res.user.phone,
        city: res.user.city || 'Lucknow',
        clearCoins: res.user.clearCoins ?? 250,
        membershipTier: res.user.membershipTier || ('Silver Grain' as const),
        createdAt: res.user.createdAt || new Date().toISOString()
      };
      setCurrentUser(userProfile);
      setIsAuthenticated(true);
      localStorage.setItem('itsclear_auth_logged_in', 'true');
      localStorage.setItem('itsclear_current_user', JSON.stringify(userProfile));
      syncOrdersFromServer(false, userProfile.id);
      if (pendingCartAction) {
        executeAddToCart(pendingCartAction.product, pendingCartAction.variant, pendingCartAction.quantity);
        setPendingCartAction(null);
      } else {
        notify('Welcome Back!', `Email verified. Signed in as ${userProfile.name}.`, 'success');
      }
      setIsAuthModalOpen(false);
      return true;
    } catch (error: any) {
      notify('OTP Sign In Failed', error.message || 'Invalid or expired login code.', 'error');
      throw error;
    }
  };

  const sendLoginOtp = async (email: string) => {
    try {
      const res = await api.sendLoginOtp(email);
      notify('Login Code Sent', res.message || 'Check your email for the 6-digit verification code.', 'info');
      return res;
    } catch (err: any) {
      notify('Code Request Failed', err.message || 'Could not send verification code.', 'error');
      throw err;
    }
  };

  const loginWithGoogle = async (credential: string) => {
    try {
      const res = await api.googleAuth(credential, 'customer');
      if (res.requiresLinking) {
        return {
          success: false,
          requiresLinking: true,
          email: res.email,
          name: res.name,
          message: res.message
        };
      }
      if (res && res.user) {
        const userProfile = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          phone: res.user.phone || '',
          city: res.user.city || 'Lucknow',
          clearCoins: res.user.clearCoins ?? 250,
          membershipTier: res.user.membershipTier || ('Silver Grain' as const),
          createdAt: res.user.createdAt || new Date().toISOString()
        };
        setCurrentUser(userProfile);
        setIsAuthenticated(true);
        localStorage.setItem('itsclear_auth_logged_in', 'true');
        localStorage.setItem('itsclear_current_user', JSON.stringify(userProfile));
        syncOrdersFromServer(false, userProfile.id);

        if (pendingCartAction) {
          executeAddToCart(pendingCartAction.product, pendingCartAction.variant, pendingCartAction.quantity);
          setPendingCartAction(null);
        } else {
          notify('Welcome!', res.message || `Signed in with Google as ${userProfile.name}.`, 'success');
        }
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false };
    } catch (err: any) {
      notify('Google Sign In Failed', err.message || 'Could not authenticate with Google.', 'error');
      throw err;
    }
  };

  const linkGoogleAccount = async (credential: string, opts: { password?: string; otp?: string }) => {
    try {
      const res = await api.googleLink(credential, opts);
      if (res && res.user) {
        const userProfile = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          phone: res.user.phone || '',
          city: res.user.city || 'Lucknow',
          clearCoins: res.user.clearCoins ?? 250,
          membershipTier: res.user.membershipTier || ('Silver Grain' as const),
          createdAt: res.user.createdAt || new Date().toISOString()
        };
        setCurrentUser(userProfile);
        setIsAuthenticated(true);
        localStorage.setItem('itsclear_auth_logged_in', 'true');
        localStorage.setItem('itsclear_current_user', JSON.stringify(userProfile));
        syncOrdersFromServer(false, userProfile.id);
        notify('Accounts Linked!', 'Your Google identity has been successfully connected.', 'success');
        setIsAuthModalOpen(false);
        return true;
      }
      return false;
    } catch (err: any) {
      notify('Account Linking Failed', err.message || 'Verification failed. Could not link account.', 'error');
      throw err;
    }
  };

  const register = async (userData: { name: string; email: string; phone: string; city: string; password?: string }): Promise<boolean> => {
    try {
      const res = await api.register(userData);
      if (res && res.user) {
        const userProfile = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          phone: res.user.phone,
          city: res.user.city || userData.city,
          clearCoins: res.user.clearCoins ?? 250,
          membershipTier: res.user.membershipTier || ('Silver Grain' as const),
          createdAt: res.user.createdAt || new Date().toISOString()
        };
        setCurrentUser(userProfile);
        setIsAuthenticated(true);
        localStorage.setItem('itsclear_auth_logged_in', 'true');
        localStorage.setItem('itsclear_current_user', JSON.stringify(userProfile));
        syncOrdersFromServer(false, userProfile.id);

        if (pendingCartAction) {
          executeAddToCart(pendingCartAction.product, pendingCartAction.variant, pendingCartAction.quantity);
          setPendingCartAction(null);
        } else {
          notify('Account Created!', `Welcome to itsclear, ${userData.name}! 250 Grain Coins credited.`, 'success');
        }
        setIsAuthModalOpen(false);
        return true;
      }
      return false;
    } catch (err: any) {
      notify('Registration Failed', err.message || 'Could not create account.', 'error');
      throw err;
    }
  };

  const verifyRegistrationOtp = async (email: string, otp: string, cityName?: string) => {
    const res = await api.verifyOtpAndCreateAccount({ email, otp });
    if (res && res.user) {
      const userProfile = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        phone: res.user.phone,
        city: res.user.city || cityName || 'Lucknow',
        clearCoins: res.user.clearCoins ?? 250,
        membershipTier: res.user.membershipTier || ('Silver Grain' as const),
        createdAt: res.user.createdAt || new Date().toISOString()
      };
      setCurrentUser(userProfile);
      setIsAuthenticated(true);
      localStorage.setItem('itsclear_auth_logged_in', 'true');
      localStorage.setItem('itsclear_current_user', JSON.stringify(userProfile));
      syncOrdersFromServer(false, userProfile.id);

      if (pendingCartAction) {
        executeAddToCart(pendingCartAction.product, pendingCartAction.variant, pendingCartAction.quantity);
        setPendingCartAction(null);
      } else {
        notify('Welcome to itsclear!', 'Account created! 250 Free Grain Coins credited.', 'success');
      }
      setIsAuthModalOpen(false);
      return res;
    }
    throw new Error('Verification failed');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setPendingCartAction(null);
    setUseClearCoins(false);
    setOrders([]);
    localStorage.removeItem('itsclear_auth_logged_in');
    localStorage.removeItem('itsclear_current_user');
    localStorage.removeItem('itsclear_jwt_token');
    localStorage.removeItem('itsclear_orders_v4');
    notify('Signed Out', 'You have been signed out safely.', 'info');
  };

  const removeFromCart = (variantId: string) => {
    setCart(prevCart => prevCart.filter(item => item.selectedVariant.id !== variantId));
    notify('Item Removed', 'The item was removed from your basket.', 'info');
  };

  const updateCartQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.selectedVariant.id === variantId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setUseClearCoins(false);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      notify(
        exists ? 'Removed from Favorites' : 'Saved to Favorites',
        exists ? 'Product removed from your saved list.' : 'Saved to your favorites!',
        exists ? 'info' : 'success'
      );
      return updated;
    });
  };

  // Active items for checkout (Buy Now takes precedence over Cart)
  const activeCheckoutItems = buyNowItem ? [buyNowItem] : cart;

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = activeCheckoutItems.reduce((total, item) => total + item.selectedVariant.price * item.quantity, 0);

  // Unified Coupon validation (uses backend coupons + local unified list)
  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === cleanCode);
    if (!found) {
      notify('Invalid Coupon', 'The coupon code entered does not exist or has expired.', 'error');
      return { success: false, message: 'Invalid coupon code.' };
    }

    if (cartSubtotal < found.minOrderValue) {
      const msg = `This coupon requires a minimum order value of ₹${found.minOrderValue}.`;
      notify('Minimum Order Not Met', msg, 'warning');
      return { success: false, message: msg };
    }

    if (cleanCode === 'FREESHIP') {
      setAppliedCoupon({ code: found.code, discountAmount: 0, freeShipping: true });
      notify('Free Shipping Applied!', 'Express delivery fee waived with FREESHIP!', 'success');
      return { success: true, message: 'Free Express Delivery unlocked!' };
    }

    const calculatedDiscount =
      found.discountType === 'percentage'
        ? Math.round((cartSubtotal * found.discountValue) / 100)
        : Math.min(cartSubtotal, found.discountValue);

    setAppliedCoupon({ code: found.code, discountAmount: calculatedDiscount });
    notify('Coupon Applied!', `You saved ₹${calculatedDiscount} with ${found.code}!`, 'success');
    return { success: true, message: `Discount of ₹${calculatedDiscount} applied!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    notify('Coupon Removed', 'Promo code discount has been removed.', 'info');
  };

  // Address actions
  const addAddress = (addrData: Omit<Address, 'id'>) => {
    const newAddress: Address = { ...addrData, id: 'addr-' + Date.now().toString(36) };
    if (newAddress.isDefault || savedAddresses.length === 0) {
      setSavedAddresses(prev => [...prev.map(a => ({ ...a, isDefault: false })), newAddress]);
      setSelectedAddress(newAddress);
    } else {
      setSavedAddresses(prev => [...prev, newAddress]);
    }
    notify('Address Saved', 'New delivery address has been added.', 'success');
  };

  const deleteAddress = (id: string) => {
    setSavedAddresses(prev => {
      const filtered = prev.filter(a => a.id !== id);
      if (selectedAddress?.id === id) setSelectedAddress(filtered[0] || null);
      return filtered;
    });
    notify('Address Removed', 'Delivery address was deleted.', 'info');
  };

  // Pricing computations (100% synced with Navbar, CartDrawer, CartPage, CheckoutPage & Server)
  const cartDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const afterCoupon = Math.max(0, cartSubtotal - cartDiscount);

  // ClearCoins redemption: 1 Coin = ₹1, up to 50% of post-coupon subtotal
  const maxRedeemableCoins = currentUser ? Math.min(currentUser.clearCoins, Math.floor(afterCoupon * 0.5)) : 0;
  const coinsToRedeem = useClearCoins && isAuthenticated ? maxRedeemableCoins : 0;
  const coinsDiscount = coinsToRedeem;

  const afterAllDiscounts = Math.max(0, afterCoupon - coinsDiscount);

  // Unified Free Delivery Threshold: ₹499 everywhere (matching Navbar & CartDrawer)
  const deliveryFee =
    activeCheckoutItems.length === 0 || afterAllDiscounts >= 499 || appliedCoupon?.freeShipping ? 0 : 49;

  // Stoneground whole-wheat atta is 0% GST (tax-inclusive pricing)
  const cartTax = 0;
  const cartTotal = Math.max(0, afterAllDiscounts + deliveryFee + cartTax);

  // Place Order
  const buildOrderPayload = (details: {
    deliverySlot: string;
    paymentMethod: 'upi' | 'card' | 'cod' | 'netbanking';
    address: Address;
    gstin?: string;
  }) => ({
      items: [...activeCheckoutItems],
      subtotal: cartSubtotal,
      discount: cartDiscount + coinsDiscount,
      couponCode: appliedCoupon?.code,
      coinsUsed: coinsToRedeem,
      coinsDiscount,
      tax: cartTax,
      deliveryFee,
      ecoPackaging,
      gstin: details.gstin || '',
      total: cartTotal,
      shippingAddress: details.address,
      deliverySlot: details.deliverySlot || deliverySlot,
      paymentMethod: details.paymentMethod
  });

  const preparePayment = async (details: {
    deliverySlot: string;
    paymentMethod: 'upi' | 'card' | 'netbanking';
    address: Address;
    gstin?: string;
  }) => api.createPaymentOrder(buildOrderPayload(details));

  const placeOrder = async (details: {
    deliverySlot: string;
    paymentMethod: 'upi' | 'card' | 'cod' | 'netbanking';
    address: Address;
    gstin?: string;
  }, paymentProof?: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }): Promise<Order> => {
    const itemsToOrder = [...activeCheckoutItems];
    const payload = { ...buildOrderPayload(details), paymentProof };

    const createdOrder = await api.createOrder(payload);

    // Deduct stock in local products state immediately
    setProducts(prevProducts =>
      prevProducts.map(prod => {
        const orderedVariant = itemsToOrder.find(ci => ci.product.id === prod.id);
        if (orderedVariant) {
          return {
            ...prod,
            variants: prod.variants.map(v => {
              if (v.id === orderedVariant.selectedVariant.id) {
                const nextStock = Math.max(0, v.stockCount - orderedVariant.quantity);
                return { ...v, stockCount: nextStock, inStock: nextStock > 0 };
              }
              return v;
            })
          };
        }
        return prod;
      })
    );

    setOrders(prev => [createdOrder, ...prev]);

    // Update user's ClearCoins balance locally (earned - used)
    if (currentUser) {
      const earned = createdOrder.coinsEarned ?? Math.floor(createdOrder.total / 20);
      const updatedUser = {
        ...currentUser,
        clearCoins: Math.max(0, currentUser.clearCoins - coinsToRedeem + earned)
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('itsclear_current_user', JSON.stringify(updatedUser));
    }

    if (buyNowItem) {
      setBuyNowItem(null);
      setAppliedCoupon(null);
      setUseClearCoins(false);
    } else {
      clearCart();
    }

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#d97706', '#10b981', '#f59e0b', '#0284c7']
      });
    } catch {}

    notify('Order Confirmed!', `Order #${createdOrder.orderNumber} placed! Your atta is queued for cold-stone milling.`, 'success');
    return createdOrder;
  };

  const updateOrderStatus = async (orderId: string, status: Order['orderStatus']) => {
    try {
      const updated = await api.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
      notify('Order Updated', `Order status changed to ${status.replace(/_/g, ' ')}.`, 'info');
    } catch (err: any) {
      notify('Update Failed', err.message || 'Could not update order status.', 'error');
    }
  };

  const cancelOrder = async (orderId: string, reason: string) => {
    try {
      const updated = await api.cancelOrder(orderId, reason);
      setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
      notify('Order Cancelled', `Order #${updated.orderNumber} has been cancelled.`, 'warning');
    } catch (err: any) {
      notify('Cancel Failed', err.message || 'Could not cancel this order.', 'error');
      throw err;
    }
  };

  const requestReturn = async (orderId: string, reason: string) => {
    try {
      const updated = await api.returnOrder(orderId, reason);
      setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
      notify('Return Requested', `Pickup scheduled for Order #${updated.orderNumber}.`, 'info');
    } catch (err: any) {
      notify('Return Failed', err.message || 'Could not submit return request.', 'error');
      throw err;
    }
  };

  // Product Admin actions
  const addProduct = async (newProd: Product) => {
    const created = await api.createProduct(newProd);
    setProducts(prev => [created, ...prev]);
    notify('Product Added', `${created.name} is now live in the store database.`, 'success');
  };

  const updateProduct = async (updated: Product) => {
    const saved = await api.updateProduct(updated.id, updated);
    setProducts(prev => prev.map(p => (p.id === saved.id ? saved : p)));
    notify('Product Updated', `${saved.name} changes saved to database.`, 'info');
  };

  const deleteProduct = async (id: string) => {
    await api.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
    notify('Product Deleted', 'Product removed from store database.', 'warning');
  };

  const addReview = (reviewData: Omit<UserReview, 'id' | 'date'>) => {
    api.createReview({
      productId: reviewData.productId,
      author: reviewData.userName,
      city: reviewData.userCity || 'India',
      rating: reviewData.rating,
      comment: reviewData.comment
    })
      .then(saved => {
        const normalized: UserReview = {
          id: saved.id,
          productId: saved.productId,
          userName: (saved as any).author || reviewData.userName,
          userCity: (saved as any).city || reviewData.userCity,
          rating: saved.rating,
          comment: saved.comment,
          date: saved.date,
          verifiedPurchase: Boolean((saved as any).verified ?? saved.verifiedPurchase)
        };
        setReviews(prev => [normalized, ...prev]);
        notify('Review Submitted', 'Thank you! Your feedback has been published.', 'success');
      })
      .catch(err => {
        notify('Review Error', err.message || 'Could not submit review.', 'error');
      });
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        saveForLater,
        buyNowItem,
        wishlist,
        orders,
        coupons,
        appliedCoupon,
        savedAddresses,
        selectedAddress,
        deliverySlot,
        ecoPackaging,
        useClearCoins,
        reviews,
        notifications,
        isCartDrawerOpen,
        isAdminAuthenticated,
        loginAdmin,
        loginAdminWithGoogle,
        loginAdminWithOtp,
        logoutAdmin,
        updateAdminPassword,
        isAuthenticated,
        currentUser,
        isAuthModalOpen,
        authModalTab,
        pendingCartAction,
        user,
        login,
        loginWithOtp,
        sendLoginOtp,
        loginWithGoogle,
        linkGoogleAccount,
        register,
        verifyRegistrationOtp,
        logout,
        openAuthModal,
        closeAuthModal,
        setIsCartDrawerOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        moveToSaveForLater,
        moveToCartFromSaved,
        removeFromSavedForLater,
        startBuyNow,
        clearBuyNow,
        toggleWishlist,
        applyCoupon,
        removeCoupon,
        setSelectedAddress,
        addAddress,
        deleteAddress,
        setDeliverySlot,
        setEcoPackaging,
        setUseClearCoins,
        placeOrder,
        preparePayment,
        updateOrderStatus,
        cancelOrder,
        requestReturn,
        addProduct,
        updateProduct,
        deleteProduct,
        addReview,
        notify,
        dismissNotification,
        activeCheckoutItems,
        cartItemCount,
        cartSubtotal,
        cartDiscount,
        coinsToRedeem,
        coinsDiscount,
        deliveryFee,
        cartTax,
        cartTotal
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
